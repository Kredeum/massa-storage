import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
	await expect(page.locator('h1')).toBeVisible();
});
