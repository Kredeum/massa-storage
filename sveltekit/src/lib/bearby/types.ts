// Handles smart contract operations on the Massa blockchain
type BearbyContract = {
  getFilteredSCOutputEvent: (_filter: EventFilter) => Promise<FilterResponse>;
  readSmartContract: (_params: ContractReadParams) => Promise<FilterResponse>;
  call: (_params: ContractCallParams) => Promise<string>;
  deploy: (_params: ContractDeployParams) => Promise<string>;
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
  account: BearbyAccount;
  blockchain: unknown;
  installed: boolean;
  enabled: boolean;
  connected: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  network: string;
  getPublicKey: () => Promise<string>;
  signMessage: (_message: string) => Promise<string>;
  provider: BearbyProvider;
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
  coins: number | bigint;
  maxCoins?: number | bigint;
  maxGas: number | bigint;
  fee?: number | bigint;
  targetAddress: string;
  functionName: string;
  parameter?: ContractParameter[];
  unsafeParameters?: number[];
};

type ContractDeployParams = {
  maxGas: number | bigint;
  maxCoins?: number | bigint;
  coins?: number | bigint;
  fee?: number | bigint;
  targetAddress: string;
  functionName: string;
  parameter?: ContractParameter[];
  unsafeParameters?: number[];
  deployerBase64?: string;
  contractDataBase64?: string;
};

type ContractReadParams = {
  fee?: number | bigint;
  maxGas: number | bigint;
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
type Args = {
  addString: (value: string) => Args;
  serialize: () => Uint8Array;
};

declare global {
  interface Window {
    contract?: string;
    Args?: new () => Args;
  }
}

export type {
  Bearby,
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
  Args
};
