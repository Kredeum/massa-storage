import {
  type CID,
  create,
  type AddOptions,
  type ImportCandidate,
  type PinAddOptions,
  type PinLsOptions
} from "kubo-rpc-client";

const createKuboClient = (url = localStorage.getItem("IPFS_API")) => {
  const ipfs = create(new URL(url || ""));

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

  const ready = async (url?: string): Promise<boolean> => {
    try {
      const identity = await ipfs.id();
      return Boolean(identity.id);
    } catch (error) {
      console.info("No IPFS server found on", url);
      return false;
    }
  };

  const countPeers = async (cid: string, numProviders: number = 10): Promise<number> => {
    let count = 0;
    const peerList = await ipfs.routing.findProvs(cid, { numProviders });

    for await (const peer of peerList) {
      if (peer.name === "PROVIDER") count++;
    }

    return count;
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
    ready,
    countPeers,
    addAndPin
  };
};

export { createKuboClient };
