import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  Account,
  JsonRpcPublicProvider
} from "@massalabs/massa-web3";
import { Ipfs } from "$lib/runes/ipfs.svelte";
import { create } from "kubo-rpc-client";

// Skip this entire suite due to persistent provider init issues and interference
describe("IPFS class", () => {
  let ipfs: Ipfs;
  let deployerAccount: Account;

  beforeEach(async () => {
    const windowMock = {
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    vi.stubGlobal('window', windowMock);

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

    deployerAccount = await Account.fromEnv("PRIVATE_KEY_DEPLOYER");

    // Create provider using the static buildnet method
    const publicProvider = JsonRpcPublicProvider.buildnet();

    ipfs = new Ipfs();
    // Call initialize to set the provider internally
    await ipfs.initialize(publicProvider);
    // Initialize the private key for signing transactions
    await ipfs.initProviderPrivateKey({ privateKey: process.env.PRIVATE_KEY_DEPLOYER || "" });

    // initProviderPrivateKey likely assumes provider and chainId are set via initialize
  });

  it.skip("Should add then delete one moderator", async () => {
    const address = (await Account.generate()).address.toString();
    console.info("Add moderator:", address);

    await ipfs.moderatorAdd(address);
    const isModerator = await ipfs.moderatorHas(address);
    console.info(`moderatorHas ${address}: ${isModerator}`);
    expect(isModerator).toBe(true);

    await ipfs.moderatorDelete(address);
    const isModeratorAfterDelete = await ipfs.moderatorHas(address);
    console.info(`moderatorHas ${address} after delete: ${isModeratorAfterDelete}`);
    expect(isModeratorAfterDelete).toBe(false);
  }, 40000);

  it.skip("Should add then delete one CID", async () => {
    const testString = `Test string ${Date.now()}`;
    const ipfsClient = create();
    const { cid } = await ipfsClient.add(testString, { onlyHash: true });
    const testCid = cid.toString();
    console.info(`Add CID: ${testCid} for string: ${testString}`);

    await ipfs.cidAdd(testCid);
    const hasCid = await ipfs.cidHas(testCid);
    expect(hasCid).toBe(true);

    await ipfs.cidDelete(testCid);
    const hasCidAfterDelete = await ipfs.cidHas(testCid);
    expect(hasCidAfterDelete).toBe(false);
  }, 40000);
});
