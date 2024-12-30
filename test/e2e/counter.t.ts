import { test, expect } from '@playwright/test';

test.describe('Counter functionality', () => {
	test('should increment counter by 1', async ({ page }) => {
		// Mock the wallet provider before navigating
		await page.addInitScript(() => {
			(window as Window).massa = {
				wallet: {
					getWallets: async () => [
						{
							accounts: async () => [
								{
									address: 'AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT',
									publicKey: 'test-public-key'
								}
							],
							getClient: async () => ({
								smartContracts: () => ({
									callSmartContract: async () => ({ transactionId: '123' }),
									awaitRequiredOperationStatus: async () => {}
								})
							})
						}
					]
				}
			};
		});

		// Navigate to the page and wait for network to be idle
		await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

		// Wait for the page to be fully loaded
		await page.waitForLoadState('domcontentloaded');

		// Wait for the counter container to be visible
		await page.waitForSelector('.counter-container', { state: 'visible', timeout: 10000 });

		// Wait for the initial connection state
		await page.waitForSelector('[data-testid="wallet-status"]', {
			state: 'visible',
			timeout: 10000
		});

		// Check if wallet is connected
		const walletStatus = await page.textContent('[data-testid="wallet-status"]');
		expect(walletStatus).toContain('Connected:');

		// Enter increment value
		await page.fill('[data-testid="increment-input"]', '1');

		// Click increment button
		await page.click('[data-testid="increment-button"]');

		// Wait for counter to update
		await page.waitForFunction(
			() => {
				const counterText = document.querySelector('[data-testid="counter-value"]')?.textContent;
				return counterText && counterText.includes('1');
			},
			{ timeout: 10000 }
		);

		// Verify counter value
		const counterText = await page.textContent('[data-testid="counter-value"]');
		expect(counterText).toContain('1');
	});
});
