import type { Network, NetworkName, Provider, PublicProvider } from "@massalabs/massa-web3";
import type { EmptyObject } from "$lib/ts/types";

class Reader {
  #provider = $state<Provider | PublicProvider | undefined>();
  #network = $state<Network | undefined>();

  get provider(): Provider | PublicProvider | EmptyObject {
    return this.#provider || {};
  }
  get network(): Network | EmptyObject {
    return this.#network || {};
  }
  get ready(): boolean {
    return Boolean(this.#provider && this.#network);
  }
  get networkName(): NetworkName | "???" {
    if (!this.ready) return "???";
    return this.#network!.name as NetworkName;
  }
  get chainId(): string {
    if (!this.ready) return "???";
    return this.#network!.chainId.toString();
  }

  async initProvider(provider?: Provider | PublicProvider): Promise<boolean> {
    if (!provider) return false;
    this.#provider = provider;
    try {
      this.#network = await this.#provider.networkInfos();
    } catch (error) {
      console.error("Error while refreshing network:", error);
      return false;
    }
    return true;
  }

  constructor(provider?: Provider | PublicProvider) {
    this.initProvider(provider);
  }
}

export { Reader };
