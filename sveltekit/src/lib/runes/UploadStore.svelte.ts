import { type AddResult } from "kubo-rpc-client";
import { createKuboClient } from "$lib/ts/kubo";
import { toast } from "svelte-hot-french-toast";
import all from "it-all";

import { formatSize } from "$lib/ts/utils";
import { MAX_FILE_SIZE } from "$lib/constants/files";

export class UploadStore {
  uploadFiles = $state<FileList | undefined>();
  cids = $state<Array<string | AddResult>>([]);

  #kubo: ReturnType<typeof createKuboClient>;

  constructor() {
    this.#kubo = createKuboClient();
  }

  async processUploadedFiles(): Promise<(string | AddResult)[]> {
    if (!this.uploadFiles) return [];

    const valideFiles = Array.from(this.uploadFiles).filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds maximum size of ${formatSize(MAX_FILE_SIZE)}`);
        return false;
      }
      return true;
    });

    try {
      console.log(`Starting to process ${valideFiles.length} files`);
      const filesArray: { path: string; content: Uint8Array }[] = [];

      // Process all files first
      await Promise.all(
        valideFiles.map(async (file) => {
          console.log(`Processing file:`, file.name);
          const arrayBuffer = await file.arrayBuffer();
          const content = new Uint8Array(arrayBuffer);
          filesArray.push({
            path: file.name,
            content: content
          });
          console.log(`Added file:`, file.name);
        })
      );

      // Add all files in a single transaction
      if (filesArray.length > 0) {
        console.log(`Starting IPFS upload...`);
        this.cids = await all(this.#kubo.addAll(filesArray, { wrapWithDirectory: true }));
        console.log(`IPFS upload complete, CIDs:`, this.cids.length);
      }

      console.log(`dir-cids:`, this.cids);
      this.uploadFiles = undefined;
      return this.cids;
    } catch (error) {
      console.error(`Error uploading files:`, error);
      toast.error(`Failed to upload files`);
      this.uploadFiles = undefined;
      return [];
    }
  }
}
