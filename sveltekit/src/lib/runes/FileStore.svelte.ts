import type { FileItem, StatusType } from "$lib/ts/types";

import { toast } from "svelte-hot-french-toast";
import { STATUS_APPROVED, STATUS_REJECTED } from "@kredeum/massa-storage-common/src/constants";

export class FileStore {
  files = $state<FileItem[]>([]);
  selectedFiles = $state<string[]>([]);

  addFiles(newFiles: FileItem[]) {
    this.files = [...this.files, ...newFiles];
    if (newFiles.length > 0) {
      toast.success(`Successfully added ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}`);
    }
  }

  updateStatusType(cid: string, status: StatusType) {
    this.files = this.files.map((file) => (file.cid === cid ? { ...file, status } : file));
  }

  togglePin(cid: string) {
    this.files = this.files.map((file) =>
      file.cid === cid ? { ...file, isPinned: !file.isPinned } : file
    );
  }

  bulkApprove() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.cid) ? { ...file, status: STATUS_APPROVED } : file
    );
    this.selectedFiles = [];
  }

  bulkReject() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.cid) ? { ...file, status: STATUS_REJECTED } : file
    );
    this.selectedFiles = [];
  }

  bulkPin() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.cid) ? { ...file, isPinned: true } : file
    );
    this.selectedFiles = [];
  }

  setSelectedFiles(selected: string[]) {
    this.selectedFiles = selected;
  }
}
