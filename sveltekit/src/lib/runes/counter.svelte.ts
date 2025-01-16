import { toast } from "svelte-hot-french-toast";
import { Client } from "./client.svelte";
import { Args, OperationStatus, type Provider, type ReadSCData } from "@massalabs/massa-web3";
import { COUNTER_ADDRESS } from "$lib/ts/config";
import type { Wallet } from "@massalabs/wallet-provider";
import { shortenString } from "$lib/ts/utils";

class Counter extends Client {
  #count = $state<bigint | undefined>();
  read = async () => {
    const result: ReadSCData = await this.provider.readSC({
      func: "getCount",
      target: COUNTER_ADDRESS(this.networkName)
    });
    if (result.info.error) return toast.error("readCounter ERROR " + result.info.error);
    this.#count = new Args(result.value).nextU64();
  };
  increment = async () => {
    try {
      const op = await this.provider.callSC({
        parameter: new Args().addU64(1n).serialize(),
        func: "increment",
        target: COUNTER_ADDRESS(this.networkName)
      });
      // console.info("incrementCounter ~ op:", op);

      const txHash = op.id;
      toast.success("Transaction sent: " + shortenString(txHash));
      console.log(`https://massexplo.io/tx/${txHash}`);
      // console.log(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess)
        return toast.error("Failed to increment count");

      await this.read();
      toast.success(`Counter incremented to '${this.count}'`);
    } catch (error) {
      toast.error("Error incrementing counter");
      console.error("Error:", error);
    }
  };

  get count() {
    return this.#count;
  }

  constructor(walletOrProvider?: Wallet | Provider, accountNum = 0, walletNum = 0) {
    super(walletOrProvider, accountNum, walletNum);
  }
}

export { Counter };
