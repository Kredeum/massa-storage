import type { FileItem } from "$lib/ts/types";
import { toast } from "svelte-hot-french-toast";
import { createKuboClient } from "$lib/ts/kubo";
import { MAX_FILE_SIZE } from "$lib/constants/files";
import { formatSize, getFileType } from "$lib/ts/utils";

export class UploadStore {
  uploadFiles = $state<FileList | undefined>();
  cid = $state<string>("");
  private kubo = createKuboClient();

  async processUploadedFiles(): Promise<FileItem[]> {
    if (!this.uploadFiles) return [];

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
            } else {
              console.error("Result from addAndPin is undefined");
              toast.error("Failed to add and pin file. Unexpected result from IPFS.");
            }
          } catch (error) {
            console.error("Error in addAndPin:", error);
            toast.error("Failed to add and pin file. Check your IPFS server connection.");
          }

          const fileType = getFileType(mimeType);
          return {
            id: Date.now() + Math.random(),
            name: file.name,
            size: formatSize(file.size),
            sizeInBytes: file.size,
            type: fileType,
            tags: [],
            status: "Pending",
            isPinned: false,
            lastModified: new Date(file.lastModified).toISOString(),
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
