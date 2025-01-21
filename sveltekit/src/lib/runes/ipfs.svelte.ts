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
  modHas = async (value: string): Promise<boolean | undefined> => await this.has("mod", value);
  cidHas = async (value: string): Promise<boolean | undefined> => await this.has("cid", value);

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
  modAdd = async (value: string) => await this.add("mod", value);
  cidAdd = async (value: string) => await this.add("cid", value);

  del = async (type: string, value: string) => {
    try {
      const op = await this.provider.callSC({
        parameter: new Args().addString(value).serialize(),
        func: `${type}Del`,
        target: IPFS_ADDRESS
      });
      // console.info(`del${type} ~ op: op`);

      const txHash = op.id;
      toast.success("Transaction sent: " + shortenString(txHash));
      console.log(`https://massexplo.io/tx/${txHash}`);
      // console.log(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess) return toast.error(`Failed to ${type}Del`);

      await this.modsGet();
      toast.success(`${type}Del ok`);
    } catch (error) {
      toast.error(`Error ${type}Del`);
      console.error("Error:", error);
    }
  };
  modDel = async (value: string) => await this.del("mod", value);
  cidDel = async (value: string) => await this.del("cid", value);

  get = async (type: string) => {
    if (!this.provider.readSC) return;

    console.log(`${type}sGet`);

    const result: ReadSCData = await this.provider.readSC({
      func: `${type}sGet`,
      target: IPFS_ADDRESS
    });
    if (result.info.error) {
      toast.error(`${type}sGet ERROR ` + result.info.error);
      return;
    }

    const items: string[] = new Args(result.value).nextArray(ArrayTypes.STRING);
    console.log(`${type}Get mods`);

    if (type === "mod") this.#mods = items;
    if (type === "cid") this.#cids = items;
  };
  modsGet = async () => await this.get("mod");
  cidsGet = async () => await this.get("cid");

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
