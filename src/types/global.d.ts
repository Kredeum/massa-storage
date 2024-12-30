interface Window {
	massa?: {
		wallet: {
			getWallets: () => Promise<
				{
					accounts: () => Promise<
						{
							address: string;
							publicKey: string;
						}[]
					>;
					getClient: () => Promise<{
						smartContracts: () => {
							callSmartContract: (params: {
								targetAddress: string;
								functionName: string;
								parameter: unknown[];
								maxGas: bigint;
								coins: bigint;
								fee: bigint;
							}) => Promise<{
								transactionId: string;
							}>;
							awaitRequiredOperationStatus: (id: string) => Promise<void>;
						};
					}>;
				}[]
			>;
		};
	};
}
