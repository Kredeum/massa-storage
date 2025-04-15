import type { NetworkName } from "@massalabs/massa-web3";
 
const account = $state<{
  name?: string;
  address?: string;
  connected?: boolean;
  balance?: bigint;
  networkName?: NetworkName;
}>({});

const resetAccount = () => {
  account.name = undefined;
  account.address = undefined;
  account.balance = undefined;
  account.connected = undefined;
  account.networkName = undefined;
};

export { account, resetAccount };
