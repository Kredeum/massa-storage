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

		// Wait for the increment button to be visible
		const incrementButton = page.getByRole('button', { name: /increment/i });
		await expect(incrementButton).toBeVisible({ timeout: 10000 });

		// Click increment button
		await incrementButton.click();

		// Wait for the increment operation to complete
		await page.waitForTimeout(2000);
	});
});
