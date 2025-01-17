import * as envir from "$env/static/public";
import type { NetworkName } from "@massalabs/massa-web3";

const env = envir as Record<string, string>;

const COUNTER_ADDRESS = (networkName: NetworkName = "buildnet" as NetworkName) => {
  if (env.PUBLIC_COUNTER_ADDRESS) return env.PUBLIC_COUNTER_ADDRESS;
  if (networkName === "mainnet") return "AS1etQoQgUJUjuUsKLwmFNJQ4sDfrTg7Xm761Aw729E6ZbakJLDx";
  if (networkName === "buildnet") return "AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT";

  throw new Error(`Invalid network name ${networkName}`);
};

const GREETING_ADDRESS = "AS15R8LW3sbDpGqqbJyee7zJCXbFTjVDWg56JWz59muHxLdtSZQP";
const GREETING_KEY = "greeting_key";

const IPFS_ADDRESS = "AS1XuunGJHs4DWWhsicaUVDtqqLngzgaDSXk9iP1itZE8GEVzTvQ";
const IPFS_MODERATORS_KEY = "moderators";

const BURNER_WALLET_KEY = String(env.PUBLIC_BURNER_WALLET_KEY || "");

export {
  IPFS_ADDRESS,
  IPFS_MODERATORS_KEY,
  COUNTER_ADDRESS,
  GREETING_ADDRESS,
  GREETING_KEY,
  BURNER_WALLET_KEY
};
