import { CID } from "multiformats/cid";
import * as dagPB from "@ipld/dag-pb";
import * as raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import { base16 } from "multiformats/bases/base16";
import { base32 } from "multiformats/bases/base32";
import { base58btc } from "multiformats/bases/base58";
import { UnixFS } from "ipfs-unixfs";
import type { Version } from "multiformats/interface";

// Maximum file size (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;
// Maximum chunk size for memory efficiency (256KB)
const MAX_CHUNK_SIZE = 256 * 1024;

export type CIDVersion = 0 | 1;
export type CIDFormat = "dag-pb" | "raw";
export type CIDEncoding = "base16" | "base32" | "base58btc";

interface CIDOptions {
  version?: CIDVersion;
  format?: CIDFormat;
  encoding?: CIDEncoding;
  useChunking?: boolean;
  normalize?: boolean;
  // Maximum time to wait for CID calculation (ms)
  timeout?: number;
}

const defaultOptions: Required<CIDOptions> = {
  version: 1,
  format: "dag-pb",
  encoding: "base32",
  useChunking: true,
  normalize: true,
  timeout: 30000 // 30 seconds default timeout
};

// Export CIDError for use in other modules
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
 * Ensure we have a proper ArrayBuffer, not a SharedArrayBuffer
 */
function ensureArrayBuffer(buffer: ArrayBuffer | SharedArrayBuffer): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) {
    return buffer.slice(0);
  }
  const temp = new Uint8Array(buffer);
  const newBuffer = new ArrayBuffer(temp.length);
  new Uint8Array(newBuffer).set(temp);
  return newBuffer;
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
    yield new Uint8Array(ensureArrayBuffer(buffer));
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
 * Get the appropriate encoder based on the encoding type
 */
function getEncoder(encoding: CIDEncoding) {
  switch (encoding) {
    case "base16":
      return base16;
    case "base32":
      return base32;
    case "base58btc":
      return base58btc;
    default:
      return base32;
  }
}

/**
 * Calculate CID for a single block of data
 */
async function calculateBlockCID(
  data: Uint8Array,
  version: Version,
  format: CIDFormat
): Promise<CID> {
  try {
    if (format === "raw") {
      const hash = await sha256.digest(data);
      return CID.create(version, raw.code, hash);
    }

    const dagData = await createFileNode(data);
    const hash = await sha256.digest(dagData);
    return CID.create(version, dagPB.code, hash);
  } catch (error) {
    throw new CIDError("Failed to calculate block CID", error);
  }
}

/**
 * Calculate CID with chunking support
 */
async function calculateChunkedCID(file: File, version: Version, format: CIDFormat): Promise<CID> {
  try {
    const chunks: Uint8Array[] = [];
    const blockCIDs: CID[] = [];

    console.log("Starting chunked CID calculation...");
    console.log(`File size: ${file.size} bytes`);

    // Process file in chunks
    for await (const chunk of readFileChunks(file, MAX_CHUNK_SIZE)) {
      console.log(`Processing chunk of size: ${chunk.length} bytes`);
      chunks.push(chunk);

      // Create a DAG-PB node for each chunk
      const chunkFs = new UnixFS({
        type: "file",
        data: chunk
      });
      console.log("UnixFS node created for chunk.");

      const chunkNode: dagPB.PBNode = {
        Data: chunkFs.marshal(),
        Links: []
      };
      console.log("DAG-PB node created for chunk.");

      // Encode the chunk node
      const chunkDagData = dagPB.encode(chunkNode);
      console.log("Chunk DAG-PB data encoded.");

      const chunkHash = await sha256.digest(chunkDagData);
      console.log(`Chunk hash calculated: ${chunkHash.digest}`);

      const chunkCID = CID.create(version, dagPB.code, chunkHash);
      console.log(`Chunk CID created: ${chunkCID.toString()}`);

      blockCIDs.push(chunkCID);
    }

    console.log(`Total chunks processed: ${blockCIDs.length}`);

    // If only one chunk, return its CID directly
    if (blockCIDs.length === 1) {
      console.log("Single chunk detected. Returning its CID.");
      return blockCIDs[0];
    }

    // Create root node with links to all blocks
    const unixFs = new UnixFS({
      type: "file",
      data: new Uint8Array(0)
    });
    console.log("UnixFS root node created.");

    // Create DAG-PB node with proper CID links
    const links = blockCIDs.map((cid, index) => ({
      Name: "", // Empty name as per UnixFS spec
      Tsize: chunks[index].length,
      Hash: cid
    }));
    console.log("Links for root node created.");

    const node: dagPB.PBNode = {
      Data: unixFs.marshal(),
      Links: links
    };
    console.log("Root DAG-PB node created.");

    // Encode the node using DAG-PB codec
    const dagPBBytes = dagPB.encode(node);
    console.log("Root DAG-PB data encoded.");

    // Calculate the root hash
    const rootHash = await sha256.digest(dagPBBytes);
    console.log(`Root hash calculated: ${rootHash.digest}`);

    // Create the final CID
    const rootCID = CID.create(version, dagPB.code, rootHash);
    console.log(`Final root CID created: ${rootCID.toString()}`);

    return rootCID;
  } catch (error) {
    console.error("Error occurred during chunked CID calculation:");
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if ("cause" in error) {
        console.error("Cause:", error.cause);
      }
    }
    throw new CIDError("Failed to calculate chunked CID", error);
  }
}

/**
 * Calculate CID for a file with timeout
 */
async function calculateCIDWithTimeout(file: File, options: Required<CIDOptions>): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new CIDError("CID calculation timed out")), options.timeout);
  });

  const calculationPromise = (async () => {
    if (file.size > MAX_FILE_SIZE) {
      throw new CIDError(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
    }

    const cid = options.useChunking
      ? await calculateChunkedCID(file, options.version as Version, options.format)
      : await calculateBlockCID(
          new Uint8Array(await file.arrayBuffer()),
          options.version as Version,
          options.format
        );

    if (options.version === 0) {
      if (options.format !== "dag-pb") {
        throw new CIDError("CIDv0 only supports dag-pb format");
      }
      return cid.toV0().toString();
    }

    return cid.toString(getEncoder(options.encoding));
  })();

  return Promise.race([calculationPromise, timeoutPromise]);
}

/**
 * Calculate CID for a file
 */
export async function calculateCID(file: File, options: CIDOptions = {}): Promise<string> {
  try {
    const opts: Required<CIDOptions> = { ...defaultOptions, ...options };
    return await calculateCIDWithTimeout(file, opts);
  } catch (error) {
    if (error instanceof CIDError) {
      throw error;
    }
    throw new CIDError("Failed to calculate CID", error);
  }
}

/**
 * Parse a CID string into a CID object
 */
export function parseCID(cidString: string): CID {
  try {
    return CID.parse(cidString);
  } catch (error) {
    throw new CIDError("Failed to parse CID", error);
  }
}

/**
 * Convert a CID to a different version or encoding
 */
export function convertCID(cid: CID | string, options: CIDOptions = {}): string {
  try {
    const opts: Required<CIDOptions> = { ...defaultOptions, ...options };
    const cidObj = typeof cid === "string" ? CID.parse(cid) : cid;

    if (opts.version === 0) {
      return cidObj.toV0().toString();
    }

    const cidV1 = cidObj.version === 0 ? cidObj.toV1() : cidObj;
    return cidV1.toString(getEncoder(opts.encoding));
  } catch (error) {
    throw new CIDError("Failed to convert CID", error);
  }
}
