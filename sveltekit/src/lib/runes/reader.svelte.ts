import type { Network, NetworkName, Provider, PublicProvider } from "@massalabs/massa-web3";
import type { EmptyObject } from "$lib/ts/types";

class Reader {
  #provider = $state<Provider | PublicProvider | undefined>();
  #network = $state<Network | undefined>();
  #ready = $state<boolean>(false);

  get provider(): Provider | PublicProvider | EmptyObject {
    return this.#provider || {};
  }
  get network(): Network | EmptyObject {
    return this.#network || {};
  }
  get ready(): boolean {
    return this.#ready;
  }
  get networkName(): NetworkName | "???" {
    if (!this.ready) return "???";
    return this.#network!.name as NetworkName;
  }
  get chainId(): string {
    if (!this.ready) return "???";
    return this.#network!.chainId.toString();
  }

  async initialize(provider?: Provider | PublicProvider): Promise<boolean> {
    if (!provider) return false;
    if (this.ready) return false;

    this.#provider = provider;
    try {
      this.#network = await this.#provider.networkInfos();
      this.#ready = true;
    } catch (error) {
      console.error("Error while refreshing network:", error);
      this.#ready = false;
    }

    return this.#ready;
  }

  constructor(provider?: Provider | PublicProvider) {
    this.initialize(provider);
  }
}

export { Reader };
