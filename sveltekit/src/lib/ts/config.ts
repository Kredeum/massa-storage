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

const IPFS_ADDRESS = "AS15vzy4kw3s1k62ZdSq1Axrifri8ua3WcSHPm6VkYak5ZLu6cUs";

const BURNER_WALLET_KEY = String(env.PUBLIC_BURNER_WALLET_KEY || "");

export { IPFS_ADDRESS, COUNTER_ADDRESS, GREETING_ADDRESS, BURNER_WALLET_KEY };
