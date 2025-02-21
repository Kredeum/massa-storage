import { toast } from "svelte-hot-french-toast";

import type { Network, NetworkName, Provider, PublicProvider } from "@massalabs/massa-web3";
import type { EmptyObject } from "$lib/ts/types";

class Reader {
  // PROVIDER
  #provider = $state<Provider | PublicProvider | undefined>();
  get provider(): Provider | PublicProvider | EmptyObject {
    return this.#provider || {};
  }
  get noProvider(): boolean {
    return this.#provider === undefined;
  }
  async setProvider(provider: Provider | PublicProvider | undefined) {
    if (!provider) return;
    this.#provider = provider;
    await this.fetchNetwork();
  }

  // NETWORK
  #network = $state<Network | undefined>();
  get network(): Network | EmptyObject {
    return this.#network || {};
  }
  get noNetwork(): boolean {
    return this.#network === undefined;
  }
  get networkName(): NetworkName | "No Network" {
    if (this.noNetwork) return "No Network";
    return this.network.name as NetworkName;
  }
  get chainId(): string {
    if (this.noNetwork) return "";
    return this.network.chainId?.toString() || "";
  }

  async fetchNetwork(): Promise<Network | EmptyObject> {
    if (this.noProvider) return {};
    try {
      this.#network = await this.provider.networkInfos();
    } catch (error) {
      console.error("Error while refreshing network:", error);
      return {};
    }
    return this.#network;
  }
  async fetchChainId(): Promise<string> {
    await this.fetchNetwork();
    return this.chainId;
  }

  constructor(provider?: Provider | PublicProvider) {
    this.setProvider(provider);
  }
}

export { Reader };
