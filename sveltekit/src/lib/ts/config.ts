import addresses from "../../../../common/addresses.json";

const ipfsAddress = (chainId: string): string => {
  if (chainId in addresses) {
    return addresses[chainId as keyof typeof addresses];
  }
  throw new Error(`Invalid chain ID: ${chainId}`);
};

export { ipfsAddress };
