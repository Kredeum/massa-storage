import { toast } from "svelte-hot-french-toast";

import {
  type Network,
  type Provider,
  type NetworkName,
  JsonRpcPublicProvider,
  JsonRpcProvider
} from "@massalabs/massa-web3";

import type { EmptyObject } from "$lib/ts/types";

class Reader {
  // PROVIDER
  #provider = $state<Provider | undefined>();
  get provider(): Provider | EmptyObject {
    return this.#provider || {};
  }
  get noProvider(): boolean {
    return this.#provider === undefined;
  }
  setProvider(provider: Provider | undefined) {
    if (!provider) return;
    this.#provider = provider;
    this.refreshReader();
  }

  // NETWORK
  #network = $state<Network | EmptyObject>();
  get network(): Network | EmptyObject {
    return this.#network || {};
  }
  get networkName(): NetworkName {
    return this.network.name as NetworkName;
  }
  get chainId(): string {
    return this.network.chainId?.toString() || "";
  }

  async getChainId(): Promise<string> {
    if (!this.#network) await this.refreshReader();
    return this.chainId;
  }

  // REFRESH
  async refreshReader(): Promise<boolean> {
    if (this.noProvider) return false;

    try {
      this.#network = await this.provider.networkInfos();
    } catch (error) {
      console.error("Error while refreshing client:", error);
      return false;
    }

    return true;
  }

  constructor(provider?: Provider) {
    this.setProvider(provider);
  }
}

export { Reader };
