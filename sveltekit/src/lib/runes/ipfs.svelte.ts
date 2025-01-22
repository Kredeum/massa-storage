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
import { MODERATOR, CID } from "../../../../common/src/constants";

class Ipfs extends Client {
  #mods = $state<string[]>([]);
  #cids = $state<string[]>([]);

  has = async (type: string, value: string): Promise<boolean | undefined> => {
    if (!this.provider.readSC) return;

    const result: ReadSCData = await this.provider.readSC({
      target: IPFS_ADDRESS,
      func: `${type}Has`,
      parameter: new Args().addString(value).serialize()
    });
    if (result.info.error) {
      toast.error(`${type}Has ERROR ${result.info.error}`);
      return;
    }

    const has = new Args(result.value).nextBool();
    console.log(`${type}Has ${value}: ${has}`);

    return has;
  };
  modHas = async (value: string): Promise<boolean | undefined> => await this.has(MODERATOR, value);
  cidHas = async (value: string): Promise<boolean | undefined> => await this.has(CID, value);

  add = async (type: string, value: string) => {
    try {
      const op = await this.provider.callSC({
        target: IPFS_ADDRESS,
        func: `${type}Add`,
        parameter: new Args().addString(value).serialize()
      });

      const txHash = op.id;
      toast.success(`Transaction sent: ${shortenString(txHash)}`);
      console.log(`https://massexplo.io/tx/${txHash}`);
      // console.log(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess) {
        console.error(`${type}Add Failed to add mod ~ status: ${status}`);
        return toast.error(`Failed to ${type}Add`);
      }

      await this.modsGet();
      toast.success(`${type}Add ok`);
    } catch (error) {
      toast.error(`Error ${type}Add`);
      console.error("Error:", error);
    }
  };
  modAdd = async (value: string) => await this.add(MODERATOR, value);
  cidAdd = async (value: string) => await this.add(CID, value);

  del = async (type: string, value: string) => {
    try {
      const op = await this.provider.callSC({
        target: IPFS_ADDRESS,
        func: `${type}Del`,
        parameter: new Args().addString(value).serialize()
      });
      // console.info(`del${type} ~ op: op`);

      const txHash = op.id;
      toast.success("Transaction sent: " + shortenString(txHash));
      console.log(`https://massexplo.io/tx/${txHash}`);
      // console.log(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess) return toast.error(`Failed to ${type}Del`);

      await this.modsGet();
      toast.success(`Moderator delete ok`);
    } catch (error) {
      toast.error(`Error ${type}Del`);
      console.error("Error:", error);
    }
  };
  modDelete = async (value: string) => await this.del(MODERATOR, value);
  cidDelete = async (value: string) => await this.del(CID, value);

  get = async (type: string) => {
    if (!this.provider.readSC) return;

    const func = `${type}sGet`;
    console.log(func, $state.snapshot(this.#mods), $state.snapshot(this.#cids));
    console.log(func, "~ IPFS_ADDRESS:", IPFS_ADDRESS);

    const result: ReadSCData = await this.provider.readSC({
      target: IPFS_ADDRESS,
      func,
      parameter: new Args().addString("").serialize()
    });
    if (result.info.error) {
      console.log(`${func} ERROR ${result.info.error}`);
      toast.error(`${func} ERROR`);
      return;
    }

    const items: string[] = new Args(result.value).nextArray(ArrayTypes.STRING);
    console.log(`${func} ${items}`);

    if (type === MODERATOR) this.#mods = items;
    if (type === CID) this.#cids = items;
  };
  modsGet = async () => await this.get(MODERATOR);
  cidsGet = async () => await this.get(CID);

  get mods() {
    return this.#mods;
  }
  get cids() {
    return this.#cids;
  }

  constructor(walletOrProvider?: Wallet | Provider, accountNum = 0, walletNum = 0) {
    super(walletOrProvider, accountNum, walletNum);
  }
}

export { Ipfs };
