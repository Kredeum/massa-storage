import { toast } from "svelte-hot-french-toast";
import type { FileItem, FileStatus } from "$lib/types/file";
import { formatSize, getFileType } from "$lib/ts/utils";
import { MAX_FILE_SIZE } from "$lib/constants/files";
import { createKuboClient } from "$lib/ts/kubo";

export class FileStore {
  files = $state<FileItem[]>([]);
  selectedFiles = $state<number[]>([]);
  currentPage = $state(0);
  readonly itemsPerPage = 20;
  kubo = $state<ReturnType<typeof createKuboClient> | undefined>();

  async initialize() {
    try {
      this.kubo = createKuboClient();
    } catch (error) {
      console.error(error);
      toast.error("Failed to access IPFS server. Please check your connection.");
    }
  }

  async handleFileUpload(uploadFiles: FileList) {
    const newFiles: FileItem[] = await Promise.all(
      Array.from(uploadFiles)
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
          let cid: string | undefined;

          try {
            if (this.kubo) {
              const result = await this.kubo.addAndPin(arrayBuffer);
              if (result) {
                cid = result.toString();
                console.log("CID:", cid);
              } else {
                console.error("Result from addAndPin is undefined");
                toast.error("Failed to add and pin file. Unexpected result from IPFS.");
              }
            }
          } catch (error) {
            console.error("Error in addAndPin:", error);
            toast.error("Failed to add and pin file. IPFS operation error.");
          }

          return {
            id: Date.now() + Math.random(),
            name: file.name,
            size: formatSize(file.size),
            sizeInBytes: file.size,
            type: getFileType(mimeType),
            tags: [],
            status: "Pending" as FileStatus,
            isPinned: false,
            lastModified: new Date(file.lastModified).toISOString(),
            blob: file,
            mimeType,
            cid,
            arrayBuffer,
            file
          };
        })
    );

    this.files = [...this.files, ...newFiles];
    if (newFiles.length > 0) {
      toast.success(`Successfully added ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}`);
    }
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  handleSelectionChange(selected: number[]) {
    this.selectedFiles = selected;
  }

  handleModeration(data: { id: number; status: FileStatus }) {
    this.files = this.files.map((file) =>
      file.id === data.id ? { ...file, status: data.status } : file
    );
  }

  handlePin(id: number) {
    this.files = this.files.map((file) =>
      file.id === id ? { ...file, isPinned: !file.isPinned } : file
    );
  }

  handleAddTag(tag: string) {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.id)
        ? { ...file, tags: [...new Set([...file.tags, tag])] }
        : file
    );
  }

  handleBulkApprove() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.id) ? { ...file, status: "Approved" } : file
    );
  }

  handleBulkReject() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.id) ? { ...file, status: "Rejected" } : file
    );
  }

  handleBulkPin() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.id) ? { ...file, isPinned: true } : file
    );
  }
}
