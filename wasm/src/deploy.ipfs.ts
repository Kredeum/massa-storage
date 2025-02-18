/* eslint-disable no-console */
import {
  Account,
  Mas,
  SmartContract,
  Web3Provider,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';
import { updateAddresses } from './addresses';

const account = await Account.fromEnv();

// const provider = Web3Provider.fromRPCUrl('http://127.0.0.1:33035', account);
// const provider = Web3Provider.mainnet(account);
const provider = Web3Provider.buildnet(account);

const chainId = (await provider.networkInfos()).chainId.toString();
console.log(`Deploying contract on ${chainId}...`);

const byteCode = getScByteCode('build', 'ipfs.wasm');
const deployer = account.publicKey.toString();
console.log('deployer:', deployer);

if (!deployer) {
  console.error('Deployer address not provided');
  process.exit(1);
}

const contract = await SmartContract.deploy(provider, byteCode, undefined, {
  coins: Mas.fromString('1'),
});

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

console.log('Contract deployed at:', contract.address);
for (const event of events) {
  console.log('Event message:', event.data);
}

await updateAddresses(chainId, contract.address);
