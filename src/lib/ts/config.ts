import * as envir from "$env/static/public";
import type { NetworkName } from "@massalabs/massa-web3";

const env = envir as Record<string, string>;

const COUNTER_ADDRESS = (networkName: NetworkName = "buildnet" as NetworkName) => {
  if (env.PUBLIC_COUNTER_ADDRESS) return env.PUBLIC_COUNTER_ADDRESS;
  if (networkName === "mainnet") return "AS1etQoQgUJUjuUsKLwmFNJQ4sDfrTg7Xm761Aw729E6ZbakJLDx";
  if (networkName === "buildnet") return "AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT";

  throw new Error(`Invalid network name ${networkName}`);
};

const BURNER_WALLET_KEY = String(env.PUBLIC_BURNER_WALLET_KEY || "");

export { COUNTER_ADDRESS, BURNER_WALLET_KEY };
