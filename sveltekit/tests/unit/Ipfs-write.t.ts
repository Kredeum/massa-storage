import { SvelteMap } from "svelte/reactivity";
import { describe, it, expect, beforeEach } from "vitest";
import { Account, Web3Provider, Args, type ReadSCData, bytesToStr } from "@massalabs/massa-web3";
import { ipfsAddress } from "$lib/ts/config";
import { Ipfs } from "$lib/runes/ipfs.svelte";
import { create } from "kubo-rpc-client";

describe.skip("IPFS class", () => {
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

  it("Should add then delete one moderator", async () => {
    const account: Account = await Account.generate();
    const address = account.address.toString();
    console.log("Add moderator:", address);

    await ipfs.moderatorAdd(address);
    const isModerator = await ipfs.moderatorHas(address);
    expect(isModerator).toBe(true);

    await ipfs.moderatorDelete(address);
    const isModeratorAfterDelete = await ipfs.moderatorHas(address);
    expect(isModeratorAfterDelete).toBe(false);
  }, 40000 );

  it("Should add then delete one CID", async () => {
    const testString = `Test string ${Date.now()}`;
    const ipfsClient = create();
    const { cid } = await ipfsClient.add(testString, { onlyHash: true });
    const testCid = cid.toString();
    console.log("Add CID:", testCid, "for string:", testString);

    await ipfs.cidAdd(testCid);
    const hasCid = await ipfs.cidHas(testCid);
    expect(hasCid).toBe(true);

    await ipfs.cidDelete(testCid);
    const hasCidAfterDelete = await ipfs.cidHas(testCid);
    expect(hasCidAfterDelete).toBe(false);
  }, 40000);
});
