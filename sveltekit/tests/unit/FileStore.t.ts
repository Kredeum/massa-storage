import { describe, it, expect, beforeEach } from "vitest";
import { FileStore } from "$lib/runes/FileStore.svelte";
import type { FileItem } from "$lib/ts/types";
import {
  STATUS_APPROVED,
  STATUS_PENDING,
  STATUS_REJECTED
} from "@kredeum/massa-storage-common/src/constants";

describe("FileStore", () => {
  let fileStore: FileStore;
  let testFiles: FileItem[];

  beforeEach(() => {
    fileStore = new FileStore();
    testFiles = [
      {
        cid: "test-cid-1",
        name: "test1.jpg",
        status: STATUS_PENDING,
        sizeInBytes: 1000,
        type: "image",
        isPinned: false
      },
      {
        cid: "test-cid-2",
        name: "test2.pdf",
        status: STATUS_PENDING,
        sizeInBytes: 2000,
        type: "document",
        isPinned: false
      }
    ];
  });

  it("should add files to the store", () => {
    fileStore.addFiles(testFiles);
    expect(fileStore.files).toHaveLength(2);
    expect(fileStore.files[0].name).toBe("test1.jpg");
    expect(fileStore.files[1].name).toBe("test2.pdf");
  });

  it("should update file status", () => {
    fileStore.addFiles(testFiles);
    fileStore.updateStatusType("test-cid-1", STATUS_APPROVED);
    expect(fileStore.files[0].status).toBe(STATUS_APPROVED);
    expect(fileStore.files[1].status).toBe(STATUS_PENDING);
  });

  it("should toggle pin status", () => {
    fileStore.addFiles(testFiles);
    fileStore.togglePin("test-cid-1");
    expect(fileStore.files[0].isPinned).toBe(true);
    expect(fileStore.files[1].isPinned).toBe(false);
  });

  it("should bulk approve files", () => {
    fileStore.addFiles(testFiles);
    fileStore.selectedFiles = ["test-cid-1", "test-cid-2"];
    fileStore.bulkApprove();
    expect(fileStore.files[0].status).toBe(STATUS_APPROVED);
    expect(fileStore.files[1].status).toBe(STATUS_APPROVED);
    expect(fileStore.selectedFiles).toHaveLength(0);
  });

  it("should bulk reject files", () => {
    fileStore.addFiles(testFiles);
    fileStore.selectedFiles = ["test-cid-1", "test-cid-2"];
    fileStore.bulkReject();
    expect(fileStore.files[0].status).toBe(STATUS_REJECTED);
    expect(fileStore.files[1].status).toBe(STATUS_REJECTED);
    expect(fileStore.selectedFiles).toHaveLength(0);
  });
});

it("Should bulk approve/reject files", () => {
  // Test multiple file status changes
});
