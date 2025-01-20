/// <reference types="@sveltejs/kit" />
/* eslint-disable no-unused-vars */

declare global {
  interface Window {
    massa: {
      wallet: {
        getWallets: () => Promise<
          {
            accounts: () => Promise<{ address: string; publicKey: string }[]>;
            getClient: () => Promise<{
              smartContracts: () => {
                callSmartContract: (params: {
                  targetAddress: string;
                  functionName: string;
                  parameter: unknown[];
                  maxGas: bigint;
                  coins: bigint;
                  fee: bigint;
                }) => Promise<{ transactionId: string }>;
                awaitRequiredOperationStatus: (operation: {
                  transactionId: string;
                }) => Promise<void>;
              };
            }>;
          }[]
        >;
      };
    };
  }
}

export {};
