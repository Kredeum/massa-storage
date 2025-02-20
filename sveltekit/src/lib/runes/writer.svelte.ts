import { Account, Web3Provider, type Provider } from "@massalabs/massa-web3";
import { Reader } from "./reader.svelte";
import { shortenString } from "$lib/ts/utils";
import { getWallet, WalletName, type Wallet } from "@massalabs/wallet-provider";

class Writer extends Reader {
  #wallet = $state<Wallet | undefined>();
  #type = $state<"Provider" | "Wallet" | "PrivateKey">("Provider");

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
    return this.#type === "PrivateKey"
      ? "Burner Wallet"
      : this.provider.providerName || this.provider.accountName || "No name";
  }
  #balance = $state<bigint | undefined>();
  get address() {
    return this.provider.address || "???";
  }
  get addressToDisplay() {
    return shortenString(this.provider.address || "???");
  }
  get balance() {
    return this.#balance;
  }
  get balanceToDisplay() {
    return this.#balance ? `${(Number(this.#balance) / 1e9).toFixed(2)} MAS` : "0.00 MAS";
  }

  async refresh(): Promise<boolean> {
    if (this.noProvider) return false;

    try {
      this.#balance = await this.provider.balance(true);
    } catch (error) {
      console.error("Error while refreshing balance:", error);
      return false;
    }

    return super.refresh();
  }

  // CONNECT
  async connect(): Promise<boolean> {
    console.log("connect ~ async connect():", this.noProvider, this.noConnect, this.#connected);

    if (this.noProvider) return false;
    if (this.#connected) return true;

    this.#connected = this.noConnect || (await this.#wallet!.connect());

    await this.refresh();

    return this.#connected;
  }

  // DISCONNECT
  async disconnect(): Promise<boolean> {
    console.log("disconnect ~ disconnect:", this.noProvider, this.#connected);
    if (this.noProvider) return false;
    if (!this.#connected) return true;

    this.#connected = false;
    this.#balance = undefined;

    return true;
  }

  async setProviderFromWallet(walletName = WalletName.Bearby, accountNum = 0): Promise<void> {
    const wallet = await getWallet(walletName);
    if (!wallet) throw new Error(`Wallet ${walletName} not found`);

    this.#wallet = wallet;

    const accounts = await wallet.accounts();
    const provider = accounts[accountNum];
    if (!provider) throw new Error(`Wallet ${walletName} Account #${accountNum} not found`);

    this.#type = "Wallet";
    this.provider = provider;

    await this.connect();
  }

  // ONLY for testnet address
  // DO NOT use with address with real value on mainnet !!!
  async setProviderFromPrivateKey(privateKey: string): Promise<void> {
    const account = await Account.fromPrivateKey(privateKey);
    console.log("setProviderFromPrivateKey", account.address.toString());

    this.#type = "PrivateKey";
    this.provider = Web3Provider.buildnet(account);

    await this.connect();
  }

  constructor(
    param?: Provider | { privateKey: string } | { walletName: WalletName; accountNum?: number }
  ) {
    // Default Wallet
    if (!param) {
      super();
      this.setProviderFromWallet();
      return;
    }

    // Provider
    if ("address" in param) {
      super(param);
      return;
    }

    super();

    // Wallet
    if ("walletName" in param) this.setProviderFromWallet(param.walletName, param.accountNum);

    // PrivateKey
    if ("privateKey" in param) this.setProviderFromPrivateKey(param.privateKey);
  }
}

export { Writer };
