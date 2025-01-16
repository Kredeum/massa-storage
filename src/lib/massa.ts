import * as massaWeb3 from "@massalabs/massa-web3";
import * as walletProvider from "@massalabs/wallet-provider";

const { Args, EventPoller } = massaWeb3;
const { getWallets } = walletProvider;

export { Args, EventPoller, getWallets };
