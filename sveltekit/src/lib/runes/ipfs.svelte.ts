import {
  type Provider,
  type PublicProvider,
  type ReadSCData,
  Args,
  ArrayTypes,
  bytesToStr,
  OperationStatus
} from "@massalabs/massa-web3";

import { ipfsAddress } from "$lib/ts/config";

import toast from "svelte-hot-french-toast";
import { shortenString } from "$lib/ts/utils";
import { MODERATOR, CID, STATUS_APPROVED, STATUS_REJECTED } from "../../../../common/src/constants";
import type { CidDataType } from "$lib/ts/types";
import { SvelteMap } from "svelte/reactivity";
import { PrivateKeyProvider, Writer } from "./writer.svelte";

class Ipfs extends Writer {
  #mods = $state<string[]>([]);
  #cids = $state<SvelteMap<string, CidDataType>>(new SvelteMap());
  #owner = $state<string | undefined>();

  has = async (type: string, value: string): Promise<boolean | undefined> => {
    if (!("readSC" in this.provider)) return;
    if (!this.chainId) return;

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
    console.info(`${type}Has ${value}: ${has}`);

    return has;
  };
  moderatorHas = async (moderator?: string): Promise<boolean | undefined> =>
    Boolean(moderator && (await this.has(MODERATOR, moderator)));

  get owner(): string | undefined {
    return this.#owner;
  }

  fetchOwner = async (): Promise<string> => {
    try {
      const dataStoreVal = await this.provider.readStorage(
        ipfsAddress(this.chainId),
        ["OWNER"],
        false
      );
      const owner = bytesToStr(dataStoreVal[0]);
      console.info("owner :", owner);

      this.#owner = owner;

      return this.#owner;
    } catch (error) {
      toast.error(`Error fetchOwner`);
      console.error("Error:", error);
      return "";
    }
  };

  cidHas = async (cid: string): Promise<boolean | undefined> => await this.has(CID, cid);

  add = async (type: string, value: string) => {
    if (!("callSC" in this.provider)) return;
    if (!this.chainId) return;

    try {
      const op = await this.provider.callSC({
        target: ipfsAddress(this.chainId),
        func: `${type}Add`,
        parameter: new Args().addString(value).serialize()
      });

      const txHash = op.id;
      toast.success(`Transaction sent: ${shortenString(txHash)}`);
      console.info(`https://massexplo.io/tx/${txHash}`);
      // console.info(`https://explorer.massa.net/mainnet/operation/${txHash}`);

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

  cidSet = async (cid: string, value: string): Promise<boolean> => {
    if (!("callSC" in this.provider)) return false;
    if (!this.chainId) return false;

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
      console.info(`https://massexplo.io/tx/${txHash}`);
      // console.info(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess) {
        console.error(`Failed to cidSet ~ status: ${status}`);
        return false;
      }

      await this.moderatorsGet();
      console.info(`Moderator cidSet ok`);
      return true;
    } catch (error) {
      console.info("Info:", error);
      return false;
    }
  };

  cidValidate = async (cid: string): Promise<boolean> => {
    try {
      // First, get the current attributes
      const attributes: CidDataType | null = await this.cidGet(cid);
      if (!attributes) {
        throw new Error("CID not found");
      }

      attributes.status = STATUS_APPROVED;

      // Set the updated attributes
      const success = await this.cidSet(cid, JSON.stringify(attributes));
      return success;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  cidReject = async (cid: string): Promise<boolean> => {
    try {
      // First, get the current attributes
      const attributes: CidDataType | null = await this.cidGet(cid);
      if (!attributes) {
        throw new Error("CID not found");
      }

      attributes.status = STATUS_REJECTED;

      // Set the updated attributes
      const success = await this.cidSet(cid, JSON.stringify(attributes));
      return success;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  del = async (type: string, value: string) => {
    if (!("callSC" in this.provider)) return;
    if (!this.chainId) return;

    try {
      const op = await this.provider.callSC({
        target: ipfsAddress(this.chainId),
        func: `${type}Delete`,
        parameter: new Args().addString(value).serialize()
      });
      // console.info(`del${type} ~ op: op`);

      const txHash = op.id;
      toast.success("Transaction sent: " + shortenString(txHash));
      console.info(`https://massexplo.io/tx/${txHash}`);
      // console.info(`https://explorer.massa.net/mainnet/operation/${txHash}`);

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
    if (!("readSC" in this.provider)) return;
    if (!this.chainId) return;

    const func = `${type}sGet`;

    const result: ReadSCData = await this.provider.readSC({
      target: ipfsAddress(this.chainId),
      func,
      parameter: new Args().addString("").serialize()
    });
    if (result.info.error) {
      console.info(`${func} ERROR ${result.info.error}`);
      toast.error(`${func} ERROR`);
      return;
    }

    const args = new Args(result.value);
    const keys: string[] = args.nextArray(ArrayTypes.STRING);
    // console.info(`${func} ${keys}`);

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

  constructor(provider?: Provider | PublicProvider | PrivateKeyProvider) {
    super(provider);
  }
}

export { Ipfs };
