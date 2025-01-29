import { create, type AddResult } from "kubo-rpc-client";
import { createKuboClient } from "$lib/ts/kubo";
import { toast } from "svelte-hot-french-toast";
import all from "it-all";

import { formatSize, getFileType, formatDate } from "$lib/ts/utils";
import { MAX_FILE_SIZE } from "$lib/constants/files";

export class UploadStore {
  uploadFiles = $state<FileList | undefined>();
  cids = $state<Array<string | AddResult>>([]);

  #kubo: ReturnType<typeof createKuboClient>;

  constructor() {
    this.#kubo = createKuboClient();
  }

  async processUploadedFiles(): Promise<any[] | undefined> {
    if (!this.uploadFiles) return;
    // const loadingToast = toast.loading("Uploading files...");

    const valideFiles = Array.from(this.uploadFiles).filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds maximum size of ${formatSize(MAX_FILE_SIZE)}`);
        return false;
      }
      return true;
    });

    try {
      await Promise.all(
        valideFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const mimeType = file.type;
          const content = new Uint8Array(arrayBuffer);
          let filesArray: { path: string; content: Uint8Array }[] = [];

          filesArray.push({
            path: file.name,
            content: content
          });
          this.cids = await all(this.#kubo.addAll(filesArray, { wrapWithDirectory: true }));
        })
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
    this.uploadFiles = undefined;
    console.log(" dir-cids:", this.cids);
    // toast.dismiss(loadingToast);
    return this.cids;
  }
}
