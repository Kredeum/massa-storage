import { describe, it, expect, beforeEach, vi } from "vitest";

import { UploadStore } from "$lib/runes/UploadStore.svelte";
import { MAX_FILE_SIZE } from "$lib/constants/files";
import { toast } from "svelte-hot-french-toast";
import { formatSize } from "$lib/ts/utils";

// Mock localStorage for the Node.js test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

// Mock toast
vi.mock("svelte-hot-french-toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}));

describe("File Upload", () => {
  let uploadStore: UploadStore;

  function createMockFileList(files: File[]): FileList {
    const fileList = {
      ...files,
      length: files.length,
      item: (index: number) => files[index],
      [Symbol.iterator]: function* () {
        for (let i = 0; i < files.length; i++) {
          yield files[i];
        }
      }
    };
    return fileList as unknown as FileList;
  }

  beforeEach(() => {
    localStorageMock.setItem('IPFS_API', 'http://127.0.0.1:5001');
    uploadStore = new UploadStore();
    vi.clearAllMocks();
  });

  it("Should initialize with empty state", () => {
    expect(uploadStore.fileList).toBeUndefined();
    expect(uploadStore.cids).toEqual([]);
  });

  it("Should upload files", async () => {
    const validFile = new File(["test content"], "test.txt");
    const fileList = createMockFileList([validFile]);

    uploadStore.fileList = fileList;
    await uploadStore.processUploadedCollections();

    expect(uploadStore.cids.length).toBeGreaterThan(0);
    expect(uploadStore.fileList).toBeUndefined();
  });

  it("Should reject files exceeding maximum size", async () => {
    const largeFile = new File([new ArrayBuffer(MAX_FILE_SIZE + 1)], "large.txt");
    const fileList = createMockFileList([largeFile]);

    uploadStore.fileList = fileList;
    await uploadStore.processUploadedCollections();

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining(
        `File ${largeFile.name} exceeds maximum size of ${formatSize(MAX_FILE_SIZE)}`
      )
    );
    expect(uploadStore.cids).toEqual([]);
  });

  it("Should handle multiple files", async () => {
    const file1 = new File(["content1"], "test1.txt");
    const file2 = new File(["content2"], "test2.txt");
    const fileList = createMockFileList([file1, file2]);

    uploadStore.fileList = fileList;
    await uploadStore.processUploadedCollections();

    expect(uploadStore.cids.length).toBeGreaterThan(1);
  });
});
