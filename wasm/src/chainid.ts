import { Account, Web3Provider } from '@massalabs/massa-web3';

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);
const chainId = (await provider.networkInfos()).chainId.toString();

console.log(`ChainId ${chainId}`);
