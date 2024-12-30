import { describe, it, expect, vi } from 'vitest';

// Mock the Massa Web3 modules
vi.mock('@massalabs/massa-web3', () => ({
	Args: vi.fn().mockImplementation(() => ({
		addU32: vi.fn()
	})),
	EventPoller: vi.fn().mockImplementation(() => ({
		waitForOperationToBeMined: vi.fn().mockResolvedValue(true)
	}))
}));

// Mock the wallet provider
vi.mock('@massalabs/wallet-provider', () => ({
	default: {
		getWallets: vi.fn().mockResolvedValue([
			{
				accounts: vi.fn().mockResolvedValue([
					{
						address: 'AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT',
						publicKey: 'test-public-key'
					}
				]),
				getClient: vi.fn().mockResolvedValue({
					smartContracts: () => ({
						callSmartContract: vi.fn().mockResolvedValue({
							transactionId: '123'
						}),
						awaitRequiredOperationStatus: vi.fn().mockResolvedValue(undefined)
					})
				})
			}
		])
	}
}));

const mockAddress = 'AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT';

describe('Counter Contract Interactions', () => {
	it('should call increment function', async () => {
		const walletProvider = (await import('@massalabs/wallet-provider')).default;
		const wallets = await walletProvider.getWallets();
		const client = await wallets[0].getClient();

		const result = await client.smartContracts().callSmartContract({
			targetAddress: mockAddress,
			functionName: 'increment',
			parameter: [1],
			maxGas: BigInt(1000000),
			coins: BigInt(0),
			fee: BigInt(0)
		});

		expect(result.transactionId).toBe('123');
	});
});
