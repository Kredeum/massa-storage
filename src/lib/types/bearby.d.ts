interface BearbyWallet {
  account?: {
    address: string;
  };
}

interface Bearby {
  wallet: BearbyWallet;
}

declare global {
  interface Window {
    bearby?: Bearby;
  }
}
