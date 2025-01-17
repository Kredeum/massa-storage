/* eslint-disable no-console */
import {
  Account,
  Args,
  Mas,
  SmartContract,
  Web3Provider,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);

console.log('Deploying contract...');

const byteCode = getScByteCode('build', 'ipfs.wasm');
const deployer = process.env.DEPLOYER_ADDRESS;
console.log('deployer:', deployer);

if (!deployer) {
  console.error('Deployer address not provided');
  process.exit(1);
}

let deployerArg = new Args().addString(deployer).serialize();

const contract = await SmartContract.deploy(provider, byteCode, deployerArg, {
  coins: Mas.fromString('0.02'),
});

console.log('Contract deployed at:', contract.address);
// AS1ueXM6LiDhwWgnDrtwRNJYmLbxnk7YtnozucXCdnXJFowGGusC

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
