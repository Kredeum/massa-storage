import type { FileItem, FileStatus } from "$lib/ts/types";
import { toast } from "svelte-hot-french-toast";

export class FileStore {
  files = $state<FileItem[]>([]);
  selectedFiles = $state<string[]>([]);

  addFiles(newFiles: FileItem[]) {
    this.files = [...this.files, ...newFiles];
    if (newFiles.length > 0) {
      toast.success(`Successfully added ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}`);
    }
  }

  updateFileStatus(cid: string, status: FileStatus) {
    this.files = this.files.map((file) => (file.cid === cid ? { ...file, status } : file));
  }

  togglePin(cid: string) {
    this.files = this.files.map((file) =>
      file.cid === cid ? { ...file, isPinned: !file.isPinned } : file
    );
  }

  addTag(tag: string, fileIds: string[]) {
    if (fileIds.length === 0) return;
    this.files = this.files.map((file) =>
      fileIds.includes(file.cid) ? { ...file, tags: [...file.tags, tag] } : file
    );
    this.selectedFiles = [];
  }

  removeTag(tag: string, fileIds: string[]) {
    if (fileIds.length === 0) return;
    this.files = this.files.map((file) =>
      fileIds.includes(file.cid) ? { ...file, tags: file.tags.filter((t) => t !== tag) } : file
    );
    this.selectedFiles = [];
  }

  bulkApprove() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.cid) ? { ...file, status: "Approved" } : file
    );
    this.selectedFiles = [];
  }

  bulkReject() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.cid) ? { ...file, status: "Rejected" } : file
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
