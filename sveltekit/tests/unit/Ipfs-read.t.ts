import { SvelteMap } from "svelte/reactivity";
import { describe, it, expect, beforeEach } from "vitest";
import {
  Account,
  bytesToStr,
  JsonRpcPublicProvider,
  type PublicProvider
} from "@massalabs/massa-web3";
import { ipfsAddress } from "$lib/ts/config";
import { Ipfs } from "$lib/runes/ipfs.svelte";

describe("IPFS class", () => {
  let ipfs: Ipfs;
  let provider: PublicProvider;
  let target: string;
  let deployer: string;

  beforeEach(async () => {
    deployer = (await Account.fromEnv("PRIVATE_KEY_DEPLOYER")).address.toString();

    provider = JsonRpcPublicProvider.buildnet();

    ipfs = new Ipfs();
    await ipfs.initialize(provider);

    target = ipfsAddress(await ipfs.chainId);
  });

  it("Before each OK", () => {});

  it("Should have valid provider", () => {
    expect(provider).toBeDefined();
    expect(ipfs.provider).toBe(provider);
  });

  it.skip("Owner should be deployer", async () => {
    const dataStoreVal = await provider.readStorage(target, ["OWNER"], false);

    const owner = bytesToStr(dataStoreVal[0]);
    console.info("Owner:", owner);

    expect(owner).toBe(deployer);
  });

  it("Should get list of moderators as Array", async () => {
    const moderators = await ipfs.moderatorsGet();
    console.info("list of moderators:", moderators);

    expect(moderators).toBeDefined();
    expect(Array.isArray(moderators)).toBe(true);
    // Check if moderators are valid addresses
    moderators.forEach((moderator) => {
      expect(typeof moderator).toBe("string");
      expect(moderator.length).toBeGreaterThan(0);
    });
  });

  it("Should get list of cids as SvelteMap", async () => {
    const cids = await ipfs.cidsGet();
    console.info("list of cids:", cids);

    expect(cids).toBeDefined();
    expect(cids instanceof SvelteMap).toBe(true);
    expect(cids.size).toBeGreaterThanOrEqual(0);
  });

  it("Should check that owner is moderator", async () => {
    const dataStoreVal = await provider.readStorage(target, ["OWNER"], false);
    const owner = bytesToStr(dataStoreVal[0]);

    const isModerator = await ipfs.moderatorHas(owner);
    expect(isModerator).toBe(true);
  });

  it("Should check if CID exists", async () => {
    const cids = await ipfs.cidsGet();
    if (cids.size === 0) return;

    const testCid = cids.keys().next().value || "-";
    const hasCid = await ipfs.cidHas(testCid);
    expect(hasCid).toBe(true);
  });

  it("Should validate CID format", async () => {
    const cids = await ipfs.cidsGet();
    cids.forEach((value, key) => {
      expect(typeof key).toBe("string");
      expect(key.startsWith("baf")).toBe(true); // IPFS v1 CIDs start with 'bafy'
    });
  });

  it("Should get cid data", async () => {
    if (!ipfs) return;
    const cids = await ipfs.cidsGet();
    const cid = cids.keys().next().value;
    if (!cid) return;
    const attributes = await ipfs.cidGet(cid);
    if (!attributes) {
      console.error("Failed to get attributes for CID:", cid);
      return;
    }
    expect(attributes).toBeDefined();
    expect(attributes.name).toBeDefined();
    expect(attributes.owner).toBeDefined();
    expect(attributes.status).toBeDefined();
    expect(attributes.timestamp).toBeDefined();

    expect(attributes.name.length).toBeGreaterThan(0);
    expect(attributes.owner.length).toBeGreaterThan(0);
    expect(attributes.status.length).toBeGreaterThan(0);
    expect(attributes.timestamp).toBeGreaterThan(0);
  });
});
