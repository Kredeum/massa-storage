import { describe, it, expect, beforeEach, vi } from "vitest";
// import { Account, Web3Provider } from "@massalabs/massa-web3";
// import { ipfsAddress } from "$lib/ts/config";
// import { Ipfs } from "$lib/runes/ipfs.svelte";
// import { createKuboClient } from "$lib/ts/kubo";

import { UploadStore } from "$lib/runes/UploadStore.svelte";
import { MAX_FILE_SIZE } from "$lib/constants/files";
import { toast } from "svelte-hot-french-toast";
import { formatSize } from "$lib/ts/utils";

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
  //   let ipfs: Ipfs;
  //   let provider: Web3Provider;
  //   let chainId: string;
  //   let target: string;
  //   let kuboClient: ReturnType<typeof createKuboClient>;
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
  //   async function connectAccount() {
  //     const account = await Account.fromEnv();
  //     provider = Web3Provider.buildnet(account);

  //     const network = await provider.networkInfos();
  //     chainId = network.chainId.toString();
  //     target = ipfsAddress(chainId);
  //     ipfs = new Ipfs(provider);
  //   }

  //   async function startIPFS() {
  //     kuboClient = await createKuboClient();
  //   }

  beforeEach(async () => {
    uploadStore = new UploadStore();
  });

  it("Should initialize with empty state", () => {
    // startIPFS();
    // connectAccount();
    expect(uploadStore.uploadFiles).toBeUndefined();
    expect(uploadStore.cids).toEqual([]);
  });

  //   it("Should not upload if not connected to account but IPFS", async () => {
  //     // startIPFS();
  //     const testFile = new File(["test content"], "test.txt");
  //     const fileList = createMockFileList([testFile]);

  //     uploadStore.uploadFiles = fileList;
  //     await uploadStore.processUploadedFiles();

  //     expect(uploadStore.cids).toEqual([]);
  //   });

  //   it("Should not upload if not connected to IPFS but account", async () => {
  //     // connectAccount();
  //     const testFile = new File(["test content"], "test.txt");
  //     const fileList = createMockFileList([testFile]);

  //     uploadStore.uploadFiles = fileList;
  //     await uploadStore.processUploadedFiles();

  //     expect(uploadStore.cids).toEqual([]);
  //   });

  //   it("Should not upload if not connected to IPFS and account", async () => {
  //     const testFile = new File(["test content"], "test.txt");
  //     const fileList = createMockFileList([testFile]);

  //     uploadStore.uploadFiles = fileList;
  //     await uploadStore.processUploadedFiles();

  //     expect(uploadStore.cids).toEqual([]);
  //   });

  it("Should upload files", async () => {
    // startIPFS();
    // connectAccount();
    const validFile = new File(["test content"], "test.txt");
    const fileList = createMockFileList([validFile]);

    uploadStore.uploadFiles = fileList;
    await uploadStore.processUploadedFiles();

    expect(uploadStore.cids.length).toBeGreaterThan(0);
    expect(uploadStore.uploadFiles).toBeUndefined();
  });

  it("Should reject files exceeding maximum size", async () => {
    // startIPFS();
    // connectAccount();
    const largeFile = new File([new ArrayBuffer(MAX_FILE_SIZE + 1)], "large.txt");
    const fileList = createMockFileList([largeFile]);

    uploadStore.uploadFiles = fileList;
    await uploadStore.processUploadedFiles();
    console.log("largeFile", largeFile.name, largeFile.size);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining(
        `File ${largeFile.name} exceeds maximum size of ${formatSize(MAX_FILE_SIZE)}`
      )
    );
    expect(uploadStore.cids).toEqual([]);
  });

  it("Should handle multiple files", async () => {
    // startIPFS();
    // connectAccount();
    const file1 = new File(["content1"], "test1.txt");
    const file2 = new File(["content2"], "test2.txt");
    const fileList = createMockFileList([file1, file2]);

    uploadStore.uploadFiles = fileList;
    await uploadStore.processUploadedFiles();

    expect(uploadStore.cids.length).toBeGreaterThan(1);
  });
});
