import { test, expect } from '@playwright/test';

test.describe('Counter functionality', () => {
    test('should increment counter by 1', async ({ page }) => {
        // Navigate to the page and wait for it to be loaded
        await page.goto('/');
        
        // Debug: Log the page content
        console.log('Page content:', await page.content());

        // Wait for the counter container to be visible
        await expect(page.locator('.counter-container')).toBeVisible();

        // Wait for the initial connection state
        await page.waitForSelector('[data-testid="wallet-status"]');

        // Get initial counter value
        const counterElement = page.getByTestId('counter-value');
        const counterText = await counterElement.textContent();
        const initialCount = parseInt(counterText?.split(':')[1].trim() || '0');

        // Input value 1 into the increment field
        const incrementInput = page.getByTestId('increment-input');
        await incrementInput.fill('1');

        // Click increment button
        const incrementButton = page.getByTestId('increment-button');
        await incrementButton.click();

        // Wait for the increment operation and toast notification
        await expect(page.getByText('Counter incremented!')).toBeVisible();

        // Verify the counter has increased by 1
        await expect(counterElement).toHaveText(`Current Count: ${initialCount + 1}`);
    });
});
