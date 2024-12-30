// @ts-ignore
import massaWeb3 from '@massalabs/massa-web3';
// @ts-ignore
import walletProvider from '@massalabs/wallet-provider';

const { Args, EventPoller, Provider } = massaWeb3;
const { getWallets } = walletProvider;
type Wallet = walletProvider.Wallet;

export {
    Args,
    EventPoller,
    Provider,
    getWallets,
    type Wallet
};
