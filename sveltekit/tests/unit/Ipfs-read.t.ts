import { SvelteMap } from "svelte/reactivity";
import { describe, it, expect, beforeEach } from "vitest";
import { Account, Web3Provider, Args, type ReadSCData, bytesToStr } from "@massalabs/massa-web3";
import { ipfsAddress } from "$lib/ts/config";
import { Ipfs } from "$lib/runes/ipfs.svelte";

describe("IPFS class", () => {
  let ipfs: Ipfs;
  let provider: Web3Provider;
  let chainId: string;
  let target: string;

  beforeEach(async () => {
    const account = await Account.fromEnv();
    provider = Web3Provider.buildnet(account);

    const network = await provider.networkInfos();
    chainId = network.chainId.toString();
    target = ipfsAddress(chainId);

    ipfs = new Ipfs(provider);
  });

  it("Should have valid provider", () => {
    expect(provider).toBeDefined();
    expect(ipfs.provider).toBe(provider);
  });

  it("Should get contract owner", async () => {
    const dataStoreVal = await provider.readStorage(target, ["OWNER"], false);

    const owner = bytesToStr(dataStoreVal[0]);
    console.log("Owner:", owner);

    expect(owner).toBeDefined();
    expect(typeof owner).toBe("string");
    expect(owner.length).toBeGreaterThan(0);
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
  it.only("Should get cid", async () => {
    if (!ipfs) return;
    const cids = await ipfs.cidsGet();
    const cid = cids.keys().next().value;
    if (!cid) return;
    const attributes = await ipfs.cidGet(cid);
    if (!attributes) {
      console.error("Failed to get attributes for CID:", cid);
      return;
    }
    console.log("cid attributes:", attributes, cid, attributes.status);
    expect(attributes).toBeDefined();
    expect(attributes.name).toBeDefined();
    expect(attributes.owner).toBeDefined();
    expect(attributes.status).toBeDefined();
    expect(attributes.date).toBeDefined();
  });
});
