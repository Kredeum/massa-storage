import { toast } from "svelte-hot-french-toast";

import { type Network, type Provider, type NetworkName } from "@massalabs/massa-web3";
import { getWallets, type Wallet } from "@massalabs/wallet-provider";

import type { EmptyObject } from "$lib/ts/types";
import { shortenString } from "$lib/ts/utils";

class Client {
  #isMassaWallet = () => this.walletName === "MASSA WALLET";

  // PROVIDER
  provider = $state<Provider | EmptyObject>({});
  chainId: string = "";

  // WALLET
  #wallet = $state<Wallet | undefined>();
  #walletConnected = $state<boolean>(false);
  get wallet() {
    return this.#wallet;
  }
  get walletName() {
    return this.#wallet?.name();
  }
  get enabled() {
    return this.#isMassaWallet() || this.#wallet?.enabled();
  }
  get connected() {
    return this.#walletConnected;
  }

  // ADDRESS
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

  // NETWORK
  #network = $state<Network | undefined>();
  get network() {
    return this.#network;
  }
  get networkName() {
    return this.#network?.name as NetworkName;
  }

  // ASYNC REFRESH
  refresh = async () => {
    console.log("refresh= ~ this.provider:", this.provider);

    try {
      this.#balance = await this.provider.balance(true);
      this.#network = await this.provider.networkInfos();
    } catch (error) {
      console.error("Error while updating Wallet:", error);
    }

    console.log("Client refreshed", this);
  };
  // RESET
  reset = () => {
    this.#balance = undefined;
    this.#network = undefined;
  };

  // return connect status
  connect = async (): Promise<boolean> => {
    if (!this.#wallet) return false;

    const connected = this.#isMassaWallet() ? true : await this.#wallet?.connect();
    if (!connected) {
      toast.error("Wallet not connected");
      return false;
    }
    this.#walletConnected = true;

    const network = await this.provider.networkInfos();
    this.chainId = network.chainId.toString();

    const info = `Connect ${this.provider.address} on ${network.name} (${network.chainId})`;
    console.info(info, connected);
    toast.success(`${this.addressToDisplay} connected`);

    await this.refresh();

    return true;
  };
  // return disconnect status
  disconnect = async () => {
    if (!this.#wallet) {
      toast.error("Wallet not found");
      return false;
    }

    const info = `Disconnect ${this.provider.address} on ${(await this.provider.networkInfos())?.name}`;
    const connected = this.#isMassaWallet() ? false : await this.#wallet?.disconnect();
    console.info(info, connected);

    if (connected) {
      toast.error("Wallet not disconnected");
      return false;
    }
    toast.success(`${this.addressToDisplay} disconnected`);

    this.#walletConnected = false;
    this.reset();
  };

  #initProvider = async (walletOrProvider?: Wallet | Provider, accountNum = 0, walletNum = 0) => {
    let wallet: Wallet | undefined;
    let provider: Provider;

    let info = "Client.#initProvider ~ ";
    let wallets: Wallet[] = [];
    let accounts: Provider[] = [];

    // walletOrProvider is PROVIDER
    if (walletOrProvider && "providerName" in walletOrProvider) {
      wallet = undefined;
      provider = walletOrProvider;
      info += `${walletOrProvider.providerName} `;
    } else {
      // walletOrProvider is WALLET
      if (walletOrProvider && "accounts" in walletOrProvider) {
        wallet = walletOrProvider;
        info += `Wallet ${wallet?.name()} `;
      }
      // walletOrProvider is UNDEFINED
      else {
        wallets = await getWallets();
        wallet = wallets[walletNum];
        info += `${wallets.length} Wallet(s) found, choose `;
      }
      info += `Wallet ${wallet?.name()} `;

      accounts = (await wallet?.accounts()) || [];
      provider = accounts[accountNum];
      info += `with ${accounts.length} Account(s), choose `;
    }

    if (!provider) {
      console.error(`Provider not found ${info}`);
      throw new Error("Provider not found");
    }
    const network = await provider.networkInfos();

    if (provider.address) {
      info += `Account ${provider.address} on ${network.name}`;
    } else {
      info += `no Account`;
    }
    console.info(info);

    this.provider = provider;
    this.chainId = network.chainId.toString();
    this.#wallet = wallet;

    await this.connect();
  };

  constructor(walletOrProvider?: Wallet | Provider, accountNum = 0, walletNum = 0) {
    this.#initProvider(walletOrProvider, accountNum, walletNum);
  }
}

export { Client };
