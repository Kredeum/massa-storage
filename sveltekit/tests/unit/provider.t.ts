import {
  Account,
  JsonRpcProvider,
  JsonRpcPublicProvider,
  type PublicProvider
} from "@massalabs/massa-web3";
import { describe, it, beforeEach, expect } from "vitest";

describe("Public Provider", () => {
  let publicProvider: PublicProvider;

  beforeEach(async () => {
    publicProvider = JsonRpcPublicProvider.buildnet();
  });

  it("Should get chainId", async () => {
    const networkInfo = await publicProvider.networkInfos();
    const chainId = networkInfo.chainId.toString();
    console.log(`ChainId ${chainId}`);

    expect(chainId).toBeDefined();
    expect(Number(chainId)).toBeGreaterThan(0);
  });

  it("Should get network name", async () => {
    const networkInfo = await publicProvider.networkInfos();
    const name = networkInfo.name;
    console.log(`Name '${name}'`);

    expect(name).toBeDefined();
    expect(name.length).toBeGreaterThan(0);
  });

  it("Should have readSC capability", () => {
    expect(publicProvider.readSC).toBeDefined();
    expect(typeof publicProvider.readSC).toBe("function");
  });

  it("Should have valid chainId", async () => {
    const networkInfo = await publicProvider.networkInfos();
    const chainId = networkInfo.chainId.toString();
    console.log(`ChainId '${chainId}'`);

    expect(chainId).toBeDefined();
    expect(typeof chainId).toBe("string");
    expect(chainId.length).toBeGreaterThan(0);
  });
});

describe("Provider", () => {
  let provider: JsonRpcProvider;

  beforeEach(async () => {
    const account = await Account.fromEnv("PRIVATE_KEY_DEPLOYER");
    provider = JsonRpcProvider.buildnet(account);
  });

  it("Should have valid address", async () => {
    const address = provider.address;
    console.log(`Address ${address}`);

    expect(address).toBeDefined();
    expect(typeof address).toBe("string");
    expect(address.length).toBeGreaterThan(0);
  });

  it("Should have callSC capability", () => {
    expect(provider.callSC).toBeDefined();
    expect(typeof provider.callSC).toBe("function");
  });

  it("Should get account balance", async () => {
    const balance = await provider.balance();
    console.log(`Balance: ${balance} nanoMASS`);

    expect(balance).toBeDefined();
    expect(typeof balance.toString()).toBe("string");
    expect(Number(balance)).toBeGreaterThanOrEqual(0);
  });
});
