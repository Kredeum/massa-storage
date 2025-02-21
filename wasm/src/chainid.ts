import { JsonRpcPublicProvider } from '@massalabs/massa-web3';

const provider = JsonRpcPublicProvider.buildnet();
const chainId = (await provider.networkInfos()).chainId.toString();

console.log(`ChainId ${chainId}`);
