// Handles smart contract operations on the Massa blockchain
type BearbyContract = {
	getFilteredSCOutputEvent: (_filter: EventFilter) => Promise<FilterResponse>;
	readSmartContract: (_params: ContractReadParams) => Promise<FilterResponse>;
	call: (_params: ContractCallParams) => Promise<string>;
	deploy: (_params: ContractCallParams) => Promise<string>;
	getDatastoreEntries: (_params: { address: string; key: string }) => Promise<FilterResponse>;
	types: ContractTypes;
};

// Core Massa blockchain interaction methods
type BearbyMassa = {
	getNodesStatus: () => Promise<NodeStatusResponse>;
	getAddresses: (_publicKey: string) => Promise<AddressResponse>;
};

// Low-level provider for direct wallet interactions
type BearbyProvider = {
	requestPubKey: () => Promise<string>;
	signMessage: (_message: string) => Promise<string>;
};

// Represents a Massa blockchain account
type BearbyAccount = {
	publicKey: string;
	address: string;
	base58: string;
};

// Main wallet functionality for user interactions
type BearbyWallet = {
	installed: boolean;
	connect: () => Promise<boolean>;
	disconnect: () => Promise<boolean>;
	network: string;
	getPublicKey: () => Promise<string>;
	signMessage: (_message: string) => Promise<string>;
	provider: BearbyProvider;
	account: BearbyAccount;
	requestPubKey: () => Promise<string>;
};

// Main Bearby wallet integration point combining all functionality
type Bearby = {
	wallet: BearbyWallet;
	contract: BearbyContract;
	massa: BearbyMassa;
};

// Contract parameter types
type ContractParameter = {
	type: string;
	value: string | number | boolean;
};

type ContractCallParams = {
	maxGas: number | bigint;
	maxCoins?: number;
	coins?: number | bigint;
	fee?: number;
	targetAddress: string;
	functionName: string;
	parameter?: ContractParameter[];
	unsafeParameters?: number[];
	deployerBase64?: string;
};

type ContractReadParams = {
	fee?: number;
	maxGas: number;
	simulatedGasPrice?: number;
	targetAddress: string;
	targetFunction: string;
	parameter?: unknown[];
	callerAddress?: string;
};

type EventFilter = {
	start: string | null;
	end: string | null;
	original_caller_address: string | null;
	original_operation_id: string | null;
	emitter_address: string | null;
};

type FilterResponse = {
	result: Array<{
		data: unknown;
		result: Array<unknown>;
	}>;
};

type NodeStatusResponse = {
	result: Array<{
		[key: string]: unknown;
	}>;
};

type AddressResponse = {
	result: Array<{
		final_balance: string;
		candidate_balance: string;
	}>;
};

type ContractTypes = {
	STRING: string;
	BOOL: string;
	F64: string;
	U256: string;
};

// Args type from Massa
interface Args {
	addString: (value: string) => Args;
	serialize: () => Uint8Array;
}

// Declare bearby as a global variable
declare const bearby: Bearby;

declare global {
	interface Window {
		bearby: Bearby;
		contract?: string;
		Args?: new () => Args;
	}
}

// Buildnet contract
const USDC = 'AS12k8viVmqPtRuXzCm6rKXjLgpQWqbuMjc37YHhB452KSUUb9FgL';

// Initialize Bearby instance
const init = async (): Promise<void> => {
	if (!('bearby' in globalThis.window)) return;
	bearby = (await globalThis.window.bearby) as Bearby;
	console.log(bearby);
};

const connect = async () => {
	console.log(bearby.wallet.installed);
	const status = await bearby.wallet.connect();
	console.log(bearby.wallet.installed);
	console.log(status);
};
const disconnect = async () => {
	const status = await bearby.wallet.disconnect();
	console.log(status);
};
const accountBalance = async () => {
	const account = bearby.wallet.account.base58;
	const res = await bearby.massa.getAddresses(account);
	const { final_balance, candidate_balance } = res.result[0];
	console.log(final_balance, candidate_balance);
};
const test_req_pub_key = async () => {
	const pubkey = await bearby.wallet.requestPubKey();
	console.log(pubkey);
};
const test_sign = async () => {
	const res = await bearby.wallet.signMessage('test');

	console.log(res);
};

const tryReadContract = async () => {
	const account = bearby.wallet.account.base58;
	const result = await bearby.contract.readSmartContract({
		fee: 0,
		maxGas: 4294167295,
		simulatedGasPrice: 0,
		targetAddress: 'AS1CNmKBzXY3jwkqempmrv95wZUMqBHRBAQK3G4vicb3WpxZAy3e',
		targetFunction: 'getMessage',
		parameter: [],
		callerAddress: account
	});
	console.log(result);
};
const tryReadContractWithUnsafeParams = async () => {
	const account = bearby.wallet.account.base58;
	const Args = window['Args'];
	if (!Args) {
		console.error('Massa-web3 is not loaded. please wait a second');
		return;
	}
	const unsafeParameters = new Args().addString(account).serialize();
	const result = await bearby.contract.readSmartContract({
		maxGas: 4294167295,
		targetAddress: USDC,
		targetFunction: 'balanceOf',
		parameter: Array.from(unsafeParameters)
	});
	console.log(result);
};
const readBalance = async () => {
	const data = await bearby.contract.readSmartContract({
		fee: 0,
		maxGas: 2100000,
		simulatedGasPrice: 0,
		targetAddress: 'AS12Emra1SrLsFgYdFRQXBjsksWummAs8zG14iFytS73bZBjbVY5v',
		targetFunction: 'balanceOf',
		parameter: [
			{
				type: bearby.contract.types.STRING,
				value: 'AU1aFiPAan1ucLZjS6iREznGYHHpTseRFAXEYvYsbCocU9RL64GW'
			}
		]
	});
	console.log('readSmartContract', data.result[0]);
};

const transfer = async () => {
	const hash = await bearby.contract.call({
		maxGas: 2000000,
		maxCoins: 100000000,
		coins: 0,
		targetAddress: 'AS1brg4nueUAT41sm8eRZrmYndUgkAhs2hwEkJD4N8UejtK2Qa9C',
		functionName: 'transfer',
		parameter: [
			{
				type: bearby.contract.types.STRING,
				value: 'Hello, World!'
			},
			{
				type: bearby.contract.types.BOOL,
				value: true
			},
			{
				type: bearby.contract.types.F64,
				value: 32
			},
			{
				type: bearby.contract.types.U256,
				value: '435435345234324324324323243242398854684'
			}
		]
	});

	console.log(hash);
};

const getDatastoreEntries = async () => {
	const data = await bearby.contract.getDatastoreEntries({ address: USDC, key: 'SYMBOL' });
	console.log('Datastore data:', data.result[0]);
};

const testunsafe = async () => {
	const hash = await bearby.contract.call({
		maxGas: 1000000,
		coins: 0,
		fee: 1000,
		targetAddress: 'AS1X4atEfMdoV4Rj9agjgpowsFgdZULpCig6SXhyX22kgnHMqK4y',
		functionName: 'logEventArgAll',
		unsafeParameters: [
			2, 0, 0, 0, 1, 2, 3, 0, 0, 0, 49, 49, 49, 9, 0, 0, 0, 114, 101, 99, 101, 105, 118, 101, 114,
			49, 3, 0, 0, 0, 77, 65, 83, 0, 0, 0, 0
		]
	});

	console.log(hash);
};

const deploy = async () => {
	const hash = await bearby.contract.deploy({
		fee: 0,
		maxGas: 3980167295n,
		maxCoins: 0.1 * 10 ** 9,
		coins: 100000000n,
		parameter: [
			{
				type: bearby.contract.types.STRING,
				value: 'Hello, World!'
			}
		],
		targetAddress: '',
		functionName: 'deploy',
		deployerBase64: ''
	});

	let k = 0;
	const intr = setInterval(async () => {
		const eventsFilter: EventFilter = {
			start: null,
			end: null,
			original_caller_address: null,
			original_operation_id: hash,
			emitter_address: null
		};
		const response = await bearby.contract.getFilteredSCOutputEvent(eventsFilter);
		if (response && response.result && response.result[0] && response.result[0].data) {
			clearInterval(intr);
			window.contract = String(response.result[0].data).replace('Address:', '');
			console.log(window.contract);
			alert(window.contract);
		}

		console.log(response);

		if (k > 10) {
			clearInterval(intr);
		}
		k += 1;
	}, 4000);
};

const getNodesStatus = async () => {
	const network = await bearby.wallet.network;
	console.log('network', network);
	const data = await bearby.massa.getNodesStatus();
	console.log('getNodesStatus', data);
};

export {
	bearby,
	USDC,
	init,
	connect,
	disconnect,
	accountBalance,
	test_req_pub_key,
	test_sign,
	tryReadContract,
	tryReadContractWithUnsafeParams,
	readBalance,
	transfer,
	getDatastoreEntries,
	testunsafe,
	deploy,
	getNodesStatus
};

export type {
	BearbyContract,
	BearbyMassa,
	BearbyProvider,
	BearbyAccount,
	BearbyWallet,
	ContractParameter,
	ContractCallParams,
	ContractReadParams,
	EventFilter,
	FilterResponse,
	NodeStatusResponse,
	AddressResponse,
	Bearby,
	Args,
	Bearby as default
};
