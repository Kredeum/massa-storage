import type { FileItem, FileStatus } from "$lib/ts/types";
import { toast } from "svelte-hot-french-toast";

export class FileStore {
  files = $state<FileItem[]>([]);
  selectedFiles = $state<number[]>([]);

  addFiles(newFiles: FileItem[]) {
    this.files = [...this.files, ...newFiles];
    if (newFiles.length > 0) {
      toast.success(`Successfully added ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}`);
    }
  }

  updateFileStatus(id: number, status: FileStatus) {
    this.files = this.files.map((file) => (file.id === id ? { ...file, status } : file));
  }

  togglePin(id: number) {
    this.files = this.files.map((file) =>
      file.id === id ? { ...file, isPinned: !file.isPinned } : file
    );
  }

  addTag(tag: string, fileIds: number[]) {
    if (fileIds.length === 0) return;
    this.files = this.files.map((file) =>
      fileIds.includes(file.id) ? { ...file, tags: [...file.tags, tag] } : file
    );
    this.selectedFiles = [];
  }

  removeTag(tag: string, fileIds: number[]) {
    if (fileIds.length === 0) return;
    this.files = this.files.map((file) =>
      fileIds.includes(file.id) ? { ...file, tags: file.tags.filter((t) => t !== tag) } : file
    );
    this.selectedFiles = [];
  }

  bulkApprove() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.id) ? { ...file, status: "Approved" } : file
    );
    this.selectedFiles = [];
  }

  bulkReject() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.id) ? { ...file, status: "Rejected" } : file
    );
    this.selectedFiles = [];
  }

  bulkPin() {
    this.files = this.files.map((file) =>
      this.selectedFiles.includes(file.id) ? { ...file, isPinned: true } : file
    );
    this.selectedFiles = [];
  }

  setSelectedFiles(selected: number[]) {
    this.selectedFiles = selected;
  }
}
