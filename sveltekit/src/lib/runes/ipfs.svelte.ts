import { Client } from "./client.svelte";
import { type Provider, bytesToStr, JsonRPCClient } from "@massalabs/massa-web3";
import { IPFS_ADDRESS, IPFS_MODERATORS_KEY } from "$lib/ts/config";

import type { Wallet } from "@massalabs/wallet-provider";

class Ipfs extends Client {
  #moderators = $state<string>("");

  read = async () => {
    console.log("Moderators read");
    const client = JsonRPCClient.buildnet();
    console.log("read= ~ client:", client);

    const dataStoreVal = await client.getDatastoreEntry(IPFS_MODERATORS_KEY, IPFS_ADDRESS, false);
    console.log("read= ~ dataStoreVal:", dataStoreVal);

    this.#moderators = bytesToStr(dataStoreVal);
  };

  get moderators() {
    return this.#moderators;
  }

  constructor(walletOrProvider?: Wallet | Provider, accountNum = 0, walletNum = 0) {
    super(walletOrProvider, accountNum, walletNum);
  }
}

export { Ipfs };
