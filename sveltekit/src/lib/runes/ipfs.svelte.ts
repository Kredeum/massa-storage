import { Client } from "./client.svelte";
import {
  type Provider,
  type ReadSCData,
  Args,
  ArrayTypes,
  OperationStatus
} from "@massalabs/massa-web3";

import { IPFS_ADDRESS } from "$lib/ts/config";

import type { Wallet } from "@massalabs/wallet-provider";
import toast from "svelte-hot-french-toast";
import { shortenString } from "$lib/ts/utils";

class Ipfs extends Client {
  #moderators = $state<string[]>([]);

  isModerator = async (moderator: string): Promise<boolean | undefined> => {
    if (!this.provider.readSC) return;

    const result: ReadSCData = await this.provider.readSC({
      target: IPFS_ADDRESS,
      func: "isModerator",
      parameter: new Args().addString(moderator).serialize()
    });
    if (result.info.error) {
      toast.error("isModerator ERROR " + result.info.error);
      return;
    }

    const isMod = new Args(result.value).nextBool();
    console.log("isModerator moderator:", moderator, isMod);

    return isMod;
  };

  addModerator = async (moderator: string) => {
    try {
      const op = await this.provider.callSC({
        target: IPFS_ADDRESS,
        func: "addModerator",
        parameter: new Args().addString(moderator).serialize()
      });

      const txHash = op.id;
      toast.success("Transaction sent: " + shortenString(txHash));
      console.log(`https://massexplo.io/tx/${txHash}`);
      // console.log(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess) {
        console.error("addModerator Failed to add moderator ~ status:", status);
        return toast.error("Failed to add moderator");
      }

      await this.getModerators();
      toast.success(`Moderator add ok`);
    } catch (error) {
      toast.error("Error adding moderator");
      console.error("Error:", error);
    }
  };

  deleteModerator = async (moderator: string) => {
    try {
      const op = await this.provider.callSC({
        parameter: new Args().addString(moderator).serialize(),
        func: "deleteModerator",
        target: IPFS_ADDRESS
      });
      // console.info("addModerator ~ op:", op);

      const txHash = op.id;
      toast.success("Transaction sent: " + shortenString(txHash));
      console.log(`https://massexplo.io/tx/${txHash}`);
      // console.log(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess)
        return toast.error("Failed to delete moderator");

      await this.getModerators();
      toast.success(`Moderator delete ok`);
    } catch (error) {
      toast.error("Error deleting moderator");
      console.error("Error:", error);
    }
  };

  getModerators = async () => {
    if (!this.provider.readSC) return;

    console.log("Moderators read");

    const result: ReadSCData = await this.provider.readSC({
      func: "getModerators",
      target: IPFS_ADDRESS
    });
    if (result.info.error) {
      toast.error("getModerators ERROR " + result.info.error);
      return;
    }

    const moderators: string[] = new Args(result.value).nextArray(ArrayTypes.STRING);
    console.log("getModerator moderators:", moderators);

    this.#moderators = moderators;
  };

  get moderators() {
    return this.#moderators;
  }

  constructor(walletOrProvider?: Wallet | Provider, accountNum = 0, walletNum = 0) {
    super(walletOrProvider, accountNum, walletNum);
  }
}

export { Ipfs };
