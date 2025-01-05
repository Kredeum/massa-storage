import type { WalletName } from "@massalabs/wallet-provider";

const account = $state<{
  address?: string;
  connected?: boolean;
  balance?: bigint;
  walletName?: WalletName;
}>({});

const resetAccount = () => {
  account.address = undefined;
  account.balance = undefined;
  account.connected = undefined;
  account.walletName = undefined;
};

export { account, resetAccount };
