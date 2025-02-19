import { Client } from "./client.svelte";
import {
  type Provider,
  type ReadSCData,
  Args,
  ArrayTypes,
  boolToByte,
  OperationStatus
} from "@massalabs/massa-web3";

import { ipfsAddress } from "$lib/ts/config";

import type { Wallet } from "@massalabs/wallet-provider";
import toast from "svelte-hot-french-toast";
import { shortenString } from "$lib/ts/utils";
import { MODERATOR, CID, STATUS_APPROVED, STATUS_REJECTED } from "../../../../common/src/constants";
import type { CidDataType } from "$lib/ts/types";
import { SvelteMap } from "svelte/reactivity";

class Ipfs extends Client {
  #mods = $state<string[]>([]);
  #cids = $state<SvelteMap<string, CidDataType>>(new SvelteMap());

  has = async (type: string, value: string): Promise<boolean | undefined> => {
    if (!this.provider.readSC) return;

    const result: ReadSCData = await this.provider.readSC({
      target: ipfsAddress(this.chainId),
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
  isModeratorFunc = (moderator: string): boolean => this.#mods.includes(moderator);
  moderatorHas = async (moderator: string): Promise<boolean | undefined> =>
    await this.has(MODERATOR, moderator);
  cidHas = async (cid: string): Promise<boolean | undefined> => await this.has(CID, cid);

  add = async (type: string, value: string) => {
    try {
      const op = await this.provider.callSC({
        target: ipfsAddress(this.chainId),
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

      await this.moderatorsGet();
      toast.success(`${type}Add ok`);
    } catch (error) {
      toast.error(`Error ${type}Add`);
      console.error("Error:", error);
    }
  };
  moderatorAdd = async (moderator: string) => await this.add(MODERATOR, moderator);
  cidAdd = async (cid: string) => await this.add(CID, cid);

  cidSet = async (cid: string, value: string) => {
    try {
      const params = {
        target: ipfsAddress(this.chainId),
        func: `cidSet`,
        parameter: new Args().addString(cid).addString(value).serialize()
      };
      const op = await this.provider.callSC(params);
      console.info("cidSet ~ params:", params);
      console.info("cidSet ~ op:", op);

      const txHash = op.id;
      toast.success("Transaction sent: " + shortenString(txHash));
      console.log(`https://massexplo.io/tx/${txHash}`);
      // console.log(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess) {
        console.error(`Failed to cidSet ~ status: ${status}`);
        return toast.error(`Failed to cidSet`);
      }

      await this.moderatorsGet();
      toast.success(`Moderator cidSet ok`);
    } catch (error) {
      toast.error(`Error cidSet`);
      console.error("Error:", error);
    }
  };

  cidValidate = async (cid: string) => {
    try {
      // First, get the current attributes
      const attributes: CidDataType | null = await this.cidGet(cid);
      if (!attributes) {
        throw new Error("CID not found");
      }

      attributes.status = STATUS_APPROVED;

      // Set the updated attributes
      await this.cidSet(cid, JSON.stringify(attributes));

      toast.success(`CID ${shortenString(cid)} validated successfully`);
    } catch (error) {
      toast.error(`Error validating CID ${shortenString(cid)}`);
      console.error("Error:", error);
    }
  };

  cidReject = async (cid: string) => {
    try {
      // First, get the current attributes
      const attributes: CidDataType | null = await this.cidGet(cid);
      if (!attributes) {
        throw new Error("CID not found");
      }

      attributes.status = STATUS_REJECTED;

      // Set the updated attributes
      await this.cidSet(cid, JSON.stringify(attributes));

      toast.success(`CID ${shortenString(cid)} rejected successfully`);
    } catch (error) {
      toast.error(`Error rejecting CID ${shortenString(cid)}`);
      console.error("Error:", error);
    }
  };

  del = async (type: string, value: string) => {
    try {
      const op = await this.provider.callSC({
        target: ipfsAddress(this.chainId),
        func: `${type}Delete`,
        parameter: new Args().addString(value).serialize()
      });
      // console.info(`del${type} ~ op: op`);

      const txHash = op.id;
      toast.success("Transaction sent: " + shortenString(txHash));
      console.log(`https://massexplo.io/tx/${txHash}`);
      // console.log(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess) return toast.error(`Failed to ${type}Del`);

      await this.moderatorsGet();
      toast.success(`Moderator delete ok`);
    } catch (error) {
      toast.error(`Error ${type}Del`);
      console.error("Error:", error);
    }
  };
  moderatorDelete = async (moderator: string) => await this.del(MODERATOR, moderator);
  cidDelete = async (cid: string) => await this.del(CID, cid);

  get = async (type: string) => {
    if (!this.provider.readSC) return;

    const func = `${type}sGet`;

    const result: ReadSCData = await this.provider.readSC({
      target: ipfsAddress(this.chainId),
      func,
      parameter: new Args().addString("").serialize()
    });
    if (result.info.error) {
      console.log(`${func} ERROR ${result.info.error}`);
      toast.error(`${func} ERROR`);
      return;
    }

    const args = new Args(result.value);
    const keys: string[] = args.nextArray(ArrayTypes.STRING);
    // console.log(`${func} ${keys}`);

    if (type === MODERATOR) {
      this.#mods = keys;
    }
    if (type === CID) {
      const values: string[] = args.nextArray(ArrayTypes.STRING);
      this.#cids = new SvelteMap(keys.map((key, index) => [key, JSON.parse(values[index])]));
    }
  };
  moderatorsGet = async () => {
    await this.get(MODERATOR);
    return this.#mods;
  };
  cidsGet = async () => {
    await this.get(CID);
    return this.#cids;
  };

  // cidGet = async (cid: string) => await this.get(CID, cid);
  cidGet = async (cid: string): Promise<CidDataType | null> => {
    if (!this.provider.readSC) {
      console.error("ReadSC not available");
      return null;
    }

    const func = `cidGet`;

    const result: ReadSCData = await this.provider.readSC({
      target: ipfsAddress(this.chainId),
      func,
      parameter: new Args().addString(cid).serialize()
    });

    if (result.info.error) {
      console.error(`${func} ERROR ${result.info.error}`);
      toast.error(`${func} ERROR`);
      return null;
    }

    const args = new Args(result.value);
    const value = args.nextString();
    if (!value) {
      console.error("Empty value returned from smart contract");
      return null;
    }

    try {
      const parsed = JSON.parse(value);
      return parsed as CidDataType;
    } catch (error) {
      console.error(`Error parsing value for CID ${cid}:`, error);
      return null;
    }
  };

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
