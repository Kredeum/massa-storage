import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import Counter from '../../../src/lib/components/Counter.svelte';

// Mock the Massa Web3 modules
vi.mock('@massalabs/massa-web3', () => ({
	Args: vi.fn().mockImplementation(() => ({
		addU32: vi.fn()
	})),
	EventPoller: vi.fn().mockImplementation(() => ({
		waitForOperationToBeMined: vi.fn().mockResolvedValue(true)
	}))
}));

// Mock the Wallet Provider
const mockWalletProvider = {
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
};

vi.mock('@massalabs/wallet-provider', () => ({
	__esModule: true,
	default: mockWalletProvider
}));

describe('Counter Business Logic', () => {
	const mockAddress = 'AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle successful wallet connection', async () => {
		const walletProvider = (await import('@massalabs/wallet-provider')).default;
		const wallets = await walletProvider.getWallets();
		expect(wallets).toBeDefined();
		expect(wallets.length).toBe(1);

		const accounts = await wallets[0].accounts();
		expect(accounts.length).toBe(1);
		expect(accounts[0].address).toBe(mockAddress);
	});

	it('should handle counter increment', async () => {
		const walletProvider = (await import('@massalabs/wallet-provider')).default;
		const wallets = await walletProvider.getWallets();
		const accounts = await wallets[0].accounts();
		const client = await wallets[0].getClient();

		expect(client).toBeTruthy();
		expect(accounts[0].address).toBe(mockAddress);

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
