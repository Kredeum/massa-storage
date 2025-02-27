import { type AddResult } from "kubo-rpc-client";
import { createKuboClient } from "$lib/ts/kubo";
import { toast } from "svelte-hot-french-toast";
import all from "it-all";

import { formatSize } from "$lib/ts/utils";
import { MAX_FILE_SIZE } from "$lib/constants/files";

export class UploadStore {
  fileList = $state<FileList | undefined>();
  cids = $state<Array<string | AddResult>>([]);

  #kubo: ReturnType<typeof createKuboClient>;

  constructor() {
    this.#kubo = createKuboClient();
  }

  async processUploadedCollections(): Promise<(string | AddResult)[]> {
    if (!this.fileList) return [];

    const valideFiles = Array.from(this.fileList).filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds maximum size of ${formatSize(MAX_FILE_SIZE)}`);
        return false;
      }
      return true;
    });

    try {
      const filesArray: { path: string; content: Uint8Array }[] = [];

      // Process all files first
      await Promise.all(
        valideFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const content = new Uint8Array(arrayBuffer);
          filesArray.push({
            path: file.name,
            content: content
          });
        })
      );

      // Add all files in a single transaction
      if (filesArray.length > 0) {
        this.cids = await all(this.#kubo.addAll(filesArray, { wrapWithDirectory: true }));
        console.info(`IPFS upload complete, CIDs:`, this.cids.length);
      }

      this.fileList = undefined;
      return this.cids;
    } catch (error) {
      console.error(`Error uploading files:`, error);
      toast.error(`Failed to upload files`);
      this.fileList = undefined;
      return [];
    }
  }
}
