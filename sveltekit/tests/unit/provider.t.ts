import { Account, Web3Provider } from "@massalabs/massa-web3";
import { describe, it, beforeEach } from "vitest";

describe("Provider", () => {
  let provider: Web3Provider;

  beforeEach(async () => {
    const account = await Account.fromEnv();
    provider = Web3Provider.buildnet(account);
  });

  it("Get address", async () => {
    const address = provider.address;
    console.log(`Address ${address}`);
  });

  it("Get chainId", async () => {
    const chainId = (await provider.networkInfos()).chainId.toString();
    console.log(`ChainId ${chainId}`);
  });

  it("Get name", async () => {
    const name = (await provider.networkInfos()).name;
    console.log(`Name '${name}'`);
  });
});
