import { describe, it, expect, beforeEach } from "vitest";
import { Ipfs } from "../../src/lib/runes/ipfs.svelte";
import { SvelteMap } from "svelte/reactivity";
import { Account, Web3Provider } from "@massalabs/massa-web3";

describe("IPFS class", () => {
  let ipfs: Ipfs;

  beforeEach(async () => {
    const account = await Account.fromEnv();
    const provider = Web3Provider.buildnet(account);

    const network = await provider.networkInfos();
    // console.log("beforeEach ~ network:", network);

    ipfs = new Ipfs(provider);
  });

  it("Should get list of moderators as Array", async () => {
    const moderators = await ipfs.moderatorsGet();
    console.info("list of moderators:", moderators);

    expect(moderators).toBeDefined();
    expect(Array.isArray(moderators)).toBe(true);
  });

  it("Should get list of cids as SvelteMap", async () => {
    const cids = await ipfs.cidsGet();
    console.info("list of cids:", cids);

    expect(cids).toBeDefined();
    expect(cids instanceof SvelteMap).toBe(true);
  });
});
