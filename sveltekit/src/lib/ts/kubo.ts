import { IPFS_API } from "@kredeum/massa-storage-common/src/constants";
import {
  type CID,
  create,
  type AddOptions,
  type ImportCandidate,
  type PinAddOptions,
  type PinLsOptions
} from "kubo-rpc-client";

const createKuboClient = (url?: string) => {
  const ipfs = create(new URL(url || IPFS_API));

  const addAndPin = async (
    data: ImportCandidate,
    addOptions?: AddOptions,
    pinOptions?: PinAddOptions
  ): Promise<CID> => await ipfs.pin.add((await ipfs.add(data, addOptions)).cid, pinOptions);

  const pins = async (options?: PinLsOptions): Promise<string[]> => {
    const cids: string[] = [];
    const pinList = ipfs.pin.ls(options);
    for await (const pin of pinList) {
      cids.push(pin.cid.toString());
    }
    return cids;
  };

  return {
    ls: ipfs.ls,
    addAll: ipfs.addAll,
    add: ipfs.add,
    pin: ipfs.pin.add,
    rm: ipfs.pin.rm,
    cat: ipfs.cat,
    stat: ipfs.files.stat,
    pins,
    addAndPin
  };
};

export { createKuboClient };
