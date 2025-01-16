import { CID } from "multiformats/cid";
import * as dagPB from "@ipld/dag-pb";
import { sha256 } from "multiformats/hashes/sha2";
import { UnixFS } from "ipfs-unixfs";

// Maximum file size (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;
// Maximum chunk size for memory efficiency (256KB)
const MAX_CHUNK_SIZE = 256 * 1024;

interface CIDOptions {
  useChunking?: boolean;
  // Maximum time to wait for CID calculation (ms)
  timeout?: number;
}

const defaultOptions: Required<CIDOptions> = {
  useChunking: true,
  timeout: 30000 // 30 seconds default timeout
};

export class CIDError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "CIDError";
  }
}

/**
 * Process a file in chunks to avoid memory issues
 */
async function* readFileChunks(file: File, chunkSize: number): AsyncGenerator<Uint8Array> {
  const fileSize = file.size;
  let offset = 0;

  while (offset < fileSize) {
    const end = Math.min(offset + chunkSize, fileSize);
    const chunk = file.slice(offset, end);
    const buffer = await chunk.arrayBuffer();
    yield new Uint8Array(buffer);
    offset = end;
  }
}

/**
 * Create a UnixFS node with the given data
 */
async function createFileNode(data: Uint8Array): Promise<Uint8Array> {
  try {
    const unixFs = new UnixFS({ type: "file", data });
    const node = {
      Data: unixFs.marshal(),
      Links: []
    };
    return dagPB.encode(node as dagPB.PBNode);
  } catch (error) {
    throw new CIDError("Failed to create file node", error);
  }
}

/**
 * Calculate CID for a file
 */
export async function calculateCID(file: File, options: CIDOptions = {}): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new CIDError(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
  }

  try {
    const cid = await calculateChunkedCID(file);
    return cid.toString();
  } catch (error) {
    throw new CIDError("Failed to calculate CID", error);
  }
}

/**
 * Calculate CID with chunking support
 */
async function calculateChunkedCID(file: File): Promise<CID> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of readFileChunks(file, MAX_CHUNK_SIZE)) {
    chunks.push(chunk);
  }

  if (chunks.length === 1) {
    const fileNode = await createFileNode(chunks[0]);
    return CID.createV1(dagPB.code, await sha256.digest(fileNode));
  }

  const nodes: { cid: CID; size: number }[] = [];

  for (const chunk of chunks) {
    const fileNode = await createFileNode(chunk);
    const cid = CID.createV1(dagPB.code, await sha256.digest(fileNode));
    nodes.push({ cid, size: chunk.length });
  }

  const rootNode = new UnixFS({
    type: "file",
    data: undefined,
    blockSizes: nodes.map((n) => BigInt(n.size))
  });
  const rootNodeBytes = dagPB.encode({
    Data: rootNode.marshal(),
    Links: nodes.map(({ cid, size }) => ({
      Hash: cid,
      Name: "",
      Tsize: size
    }))
  });

  return CID.createV1(dagPB.code, await sha256.digest(rootNodeBytes));
}
