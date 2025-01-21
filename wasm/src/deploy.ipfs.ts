/* eslint-disable no-console */
import {
  Account,
  Mas,
  SmartContract,
  Web3Provider,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

const account = await Account.fromEnv();

// const provider = Web3Provider.fromRPCUrl('http://127.0.0.1:33035', account);
// const provider = Web3Provider.mainnet(account);
const provider = Web3Provider.buildnet(account);

console.log('Deploying contract...');

const byteCode = getScByteCode('build', 'ipfs.wasm');
const deployer = process.env.DEPLOYER_ADDRESS;
console.log('deployer:', deployer);

if (!deployer) {
  console.error('Deployer address not provided');
  process.exit(1);
}

const contract = await SmartContract.deploy(provider, byteCode, undefined, {
  coins: Mas.fromString('1'),
});

console.log('Contract deployed at:', contract.address);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
