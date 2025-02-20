import { toast } from "svelte-hot-french-toast";

import { type Network, type Provider, type NetworkName } from "@massalabs/massa-web3";

import type { EmptyObject } from "$lib/ts/types";

class Reader {
  // PROVIDER
  #provider = $state<Provider | undefined>();
  set provider(provider: Provider | undefined) {
    if (!provider) return;
    console.log("setprovider ~ provider:", provider);
    this.#provider = provider;
    this.refresh();
  }
  get provider(): Provider | EmptyObject {
    return this.#provider || {};
  }
  get noProvider(): boolean {
    return this.#provider === undefined;
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
    return this.network.chainId.toString() || "";
  }

  // REFRESH
  async refresh(): Promise<boolean> {
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
    this.provider = provider;
  }
}

export { Reader };
