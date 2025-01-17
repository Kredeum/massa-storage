import { Client } from "./client.svelte";
import { type Provider, bytesToStr, JsonRPCClient } from "@massalabs/massa-web3";
import { GREETING_ADDRESS, GREETING_KEY } from "$lib/ts/config";

import type { Wallet } from "@massalabs/wallet-provider";

class Greeting extends Client {
  #greeting = $state<string>("");

  read = async () => {
    console.log("Greeting read");
    const client = JsonRPCClient.buildnet();
    console.log("read= ~ client:", client);

    const dataStoreVal = await client.getDatastoreEntry(GREETING_KEY, GREETING_ADDRESS, false);
    console.log("read= ~ dataStoreVal:", dataStoreVal);

    this.#greeting = bytesToStr(dataStoreVal);
  };

  get greeting() {
    return this.#greeting;
  }

  constructor(walletOrProvider?: Wallet | Provider, accountNum = 0, walletNum = 0) {
    super(walletOrProvider, accountNum, walletNum);
  }
}

export { Greeting };
