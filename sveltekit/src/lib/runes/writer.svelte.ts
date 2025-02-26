import {
  Account,
  JsonRpcProvider,
  type Provider,
  type PublicProvider
} from "@massalabs/massa-web3";
import { Reader } from "./reader.svelte";
import { shortenString } from "$lib/ts/utils";
import { getWallet, getWallets, WalletName, type Wallet } from "@massalabs/wallet-provider";

class PrivateKeyProvider {
  privateKey: string;
  constructor(privateKey: string) {
    this.privateKey = privateKey;
  }
}

class WalletProvider {
  walletName?: WalletName;
  accountNum?: number;
  constructor(walletName?: WalletName, accountNum?: number) {
    this.walletName = walletName;
    this.accountNum = accountNum;
  }
}

class Writer extends Reader {
  #wallet = $state<Wallet | undefined>();
  #type = $state<"PublicProvider" | "Provider" | "Wallet" | "PrivateKey">("PublicProvider");
  #accountNum = $state<number>(0);

  get wallet() {
    return this.#wallet;
  }
  get noConnect() {
    return !this.#wallet?.connect;
  }

  #connected = $state<boolean>(false);
  get connected(): boolean {
    return this.#connected;
  }

  // ACCOUNT
  get name(): string {
    if (!("providerName" in this.provider && this.provider.providerName)) return "";

    if (this.#type === "PrivateKey") return "Burner Wallet";
    if (this.provider.accountName === this.provider.address) {
      return this.provider.providerName + " #" + (this.#accountNum + 1);
    } else {
      return this.provider.accountName;
    }
  }
  #balance = $state<bigint | undefined>();
  get address() {
    if (!("address" in this.provider)) return;
    return this.provider.address || "???";
  }
  get addressToDisplay() {
    if (!("address" in this.provider)) return;
    return shortenString(this.provider.address || "???");
  }
  get balance() {
    return this.#balance;
  }
  get balanceToDisplay() {
    return this.#balance ? `${(Number(this.#balance) / 1e9).toFixed(2)} MAS` : "0.00 MAS";
  }

  async refresh(): Promise<boolean> {
    if (!this.ready) return false;
    if (!("balance" in this.provider)) return true;

    try {
      this.#balance = await this.provider.balance(true);
    } catch (error) {
      console.error("Error while refreshing balance:", error);
      return false;
    }

    return true;
  }

  // CONNECT
  async connect(): Promise<boolean> {
    if (!this.ready) return false;
    if (this.#connected) return true;

    this.#connected = this.noConnect || (await this.#wallet!.connect());

    await this.refresh();

    return this.#connected;
  }

  // DISCONNECT
  async disconnect(): Promise<boolean> {
    if (!this.ready) return false;
    if (!this.#connected) return true;

    this.#connected = false;
    this.#balance = undefined;

    return true;
  }

  async initProviderWithType(provider: Provider) {
    this.#type = "Provider";
    await this.initialize(provider);
  }

  async initProviderJsonRpcPublic(provider: PublicProvider) {
    this.#type = "PublicProvider";
    await this.initialize(provider);
  }

  async initProviderWallet(walletProvider: WalletProvider = {}): Promise<void> {
    let wallet: Wallet | undefined;

    if (!walletProvider.walletName) {
      const wallets = await getWallets();
      if (wallets.length === 0) throw new Error("No wallet installed");
      wallet = wallets[0];
    } else {
      wallet = await getWallet(walletProvider.walletName);
      if (!wallet) throw new Error(`Wallet ${walletProvider.walletName} not found`);
    }

    const accountNum = walletProvider.accountNum ?? 0;
    const accounts = await wallet.accounts();
    const provider = accounts[accountNum];
    if (!provider) {
      throw new Error(`Wallet ${wallet.name()} Account #${accountNum} not found`);
    }

    this.#wallet = wallet;
    this.#accountNum = accountNum;
    this.#type = "Wallet";
    await this.initialize(provider);

    await this.connect();
  }

  // ONLY for testnet address
  // DO NOT use with address with real value on mainnet !!!
  async initProviderPrivateKey(privateKeyProvider: PrivateKeyProvider): Promise<void> {
    const account = await Account.fromPrivateKey(privateKeyProvider.privateKey);

    this.#type = "PrivateKey";
    await this.initialize(JsonRpcProvider.buildnet(account));

    await this.connect();
  }

  constructor(param?: Provider | PublicProvider | WalletProvider | PrivateKeyProvider) {
    super();

    if (!param) this.initProviderWallet();
    else if ("providerName" in param) this.initProviderWithType(param);
    else if ("networkInfos" in param) this.initProviderJsonRpcPublic(param);
    else if ("walletName" in param) this.initProviderWallet(param);
    else if ("privateKey" in param) this.initProviderPrivateKey(param);
    else throw new Error("Invalid Writer constructor parameter");
  }
}

export { Writer, PrivateKeyProvider, WalletProvider };
