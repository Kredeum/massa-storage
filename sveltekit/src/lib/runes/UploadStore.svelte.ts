import { createKuboClient } from "$lib/ts/kubo";
import type { FileItem } from "$lib/ts/types";
import { toast } from "svelte-hot-french-toast";
import { MAX_FILE_SIZE } from "$lib/constants/files";
import { formatSize, getFileType, formatDate } from "$lib/ts/utils";
import { getContext } from "svelte";

import { FileStore } from "./FileStore.svelte";

const fileStore = new FileStore();

export class UploadStore {
  uploadFiles = $state<FileList | undefined>();
  cid = $state<string>("");
  private kubo = createKuboClient();
  // isUploading = $state<boolean>(false);

  // toastLoading(): void {
  //   toast.loading("Uploading files...");
  // }

  async processUploadedFiles(): Promise<FileItem[]> {
    if (!this.uploadFiles) return [];
    console.log("uploadFilesBefore", this.uploadFiles);

    // this.isUploading = true;

    const ipfs = getContext("ipfs");

    const newFiles: FileItem[] = await Promise.all(
      Array.from(this.uploadFiles)
        .filter((file) => {
          if (file.size > MAX_FILE_SIZE) {
            toast.error(`File ${file.name} exceeds maximum size of ${formatSize(MAX_FILE_SIZE)}`);
            return false;
          }
          return true;
        })
        .map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const mimeType = file.type;
          const content = new Uint8Array(arrayBuffer);

          try {
            const result = await this.kubo.addAndPin(content);
            if (result) {
              this.cid = result.toString();
              await ipfs?.cidAdd(this.cid);
            } else {
              console.error("Result from addAndPin is undefined");
              toast.error("Failed to add and pin file. Unexpected result from IPFS.");
            }
          } catch (error) {
            console.error("Error in addAndPin:", error);
            toast.error("Failed to add and pin file. Check your IPFS server connection.");
          }

          return {
            id: Date.now() + Math.random(),
            name: file.name,
            size: formatSize(file.size),
            sizeInBytes: file.size,
            type: getFileType(mimeType),
            tags: [],
            status: "Pending",
            isPinned: false,
            uploadDate: formatDate(),
            blob: file,
            mimeType,
            cid: this.cid,
            arrayBuffer: arrayBuffer,
            file
          };
        })
    );

    this.uploadFiles = undefined;
    return newFiles;
  }

  setUploadFiles(files: FileList | undefined) {
    // this.isUploading = false;
    this.uploadFiles = files;
  }
}
