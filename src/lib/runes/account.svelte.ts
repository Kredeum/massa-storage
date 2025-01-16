import type { NetworkName } from "@massalabs/massa-web3";
import type { WalletName } from "@massalabs/wallet-provider";

const account = $state<{
  address?: string;
  connected?: boolean;
  balance?: bigint;
  walletName?: WalletName;
  networkName?: NetworkName;
}>({});

const resetAccount = () => {
  account.address = undefined;
  account.balance = undefined;
  account.connected = undefined;
  account.walletName = undefined;
  account.networkName = undefined;
};

export { account, resetAccount };
