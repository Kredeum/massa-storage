import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import * as dagPB from "@ipld/dag-pb";
import { base32 } from "multiformats/bases/base32";
import { UnixFS } from "ipfs-unixfs";

export async function calculateCID(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    const unixFs = new UnixFS({ type: "file", data: data });
    const node = { Data: unixFs.marshal(), Links: [] };
    const dagData = dagPB.encode(node);
    const hash = await sha256.digest(dagData);
    const cid = CID.create(1, dagPB.code, hash);
    return cid.toString(base32);
  } catch (error) {
    console.error("Error calculating CID:", error);
    throw error;
  }
}
