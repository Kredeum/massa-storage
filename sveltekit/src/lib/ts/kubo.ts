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

  const pins = async (options?: PinLsOptions): Promise<CID[]> => {
    const cids: CID[] = [];
    const pinList = ipfs.pin.ls(options);
    for await (const pin of pinList) {
      cids.push(pin.cid);
    }
    return cids;
  };

  return {
    addAll: ipfs.addAll,
    add: ipfs.add,
    pin: ipfs.pin.add,
    cat: ipfs.cat,
    pins,
    addAndPin
  };
};

export { createKuboClient };
