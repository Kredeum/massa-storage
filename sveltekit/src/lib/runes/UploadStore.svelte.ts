import { createKuboClient } from "$lib/ts/kubo";
import type { FileItem } from "$lib/ts/types";
import { toast } from "svelte-hot-french-toast";
import { MAX_FILE_SIZE } from "$lib/constants/files";
import { formatSize, getFileType } from "$lib/ts/utils";
import { getContext } from "svelte";

export class UploadStore {
  uploadFiles = $state<FileList | undefined>();
  cid = $state<string>("");
  private kubo = createKuboClient();

  private formatDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  async processUploadedFiles(): Promise<FileItem[]> {
    if (!this.uploadFiles) return [];

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
            uploadDate: this.formatDate(),
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
    this.uploadFiles = files;
  }
}
