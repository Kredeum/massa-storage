import {
  CID,
  create,
  type AddOptions,
  type ImportCandidate,
  type PinAddOptions,
  type PinLsOptions
} from "kubo-rpc-client";

const createKuboClient = () => {
  const ipfs = create({
    protocol: "http",
    host: "localhost",
    port: "5001"
  });

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
    pins,
    addAndPin
  };
};

export { createKuboClient };
