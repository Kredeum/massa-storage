import { Account } from "@massalabs/massa-web3";

export const BUILDNET_DEPLOYER_ADDRESS = (
  await Account.fromPrivateKey(process.env.PRIVATE_DEPLOYER_KEY || "")
).address.toString();
