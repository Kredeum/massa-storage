import { describe, it, expect, beforeEach } from "vitest";
import { Account, JsonRpcProvider } from "@massalabs/massa-web3";
import { ipfsAddress } from "$lib/ts/config";
import { Ipfs } from "$lib/runes/ipfs.svelte";
import { create } from "kubo-rpc-client";

describe.skip("IPFS class", () => {
  let ipfs: Ipfs;
  let provider: JsonRpcProvider;
  let chainId: string;
  let target: string;

  beforeEach(async () => {
    const account = await Account.fromEnv("PRIVATE_DEPLOYER_KEY");
    provider = JsonRpcProvider.buildnet(account);

    ipfs = new Ipfs(provider);

    target = ipfsAddress(await ipfs.getChainId());
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
  }, 40000);

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
