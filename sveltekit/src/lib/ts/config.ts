import * as envir from "$env/static/public";
import addresses from "../../../../common/addresses.json";

const env = envir as Record<string, string>;

const ipfsAddress = (chainId: string): string => {
  if (chainId in addresses) {
    return addresses[chainId as keyof typeof addresses];
  }
  throw new Error(`Invalid chain ID: ${chainId}`);
};

const BURNER_WALLET_KEY_MODERATOR = String(env.PUBLIC_BURNER_WALLET_KEY_MODERATOR || "");
const BURNER_WALLET_KEY_UPLOADER = String(env.PUBLIC_BURNER_WALLET_KEY_UPLOADER || "");
const BURNER_WALLET_KEY_PINNER = String(env.PUBLIC_BURNER_WALLET_KEY_PINNER || "");

export {
  ipfsAddress,
  BURNER_WALLET_KEY_MODERATOR,
  BURNER_WALLET_KEY_UPLOADER,
  BURNER_WALLET_KEY_PINNER
};
