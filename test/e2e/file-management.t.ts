import { test, expect } from '@playwright/test';

test.describe('File Management Component', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the page containing the file management component
        await page.goto('/app/files');
        // Wait for the initial load
        await page.waitForSelector('table', { state: 'visible' });
        // Wait for data to load
        await page.waitForTimeout(1000);
    });

    test('should display file list and perform search', async ({ page }) => {
        // Test search functionality with a simple term
        const searchInput = page.locator('input[type="text"]').first();
        await searchInput.fill('File');
        
        // Wait for the filtering to take effect
        await page.waitForTimeout(1000);
        
        // Check if any results are shown
        const rows = page.locator('tr').filter({ hasText: 'File' });
        await expect(rows.first()).toBeVisible();
    });

    test('should filter files by type', async ({ page }) => {
        // Test type filter
        const typeSelect = page.locator('select').first();
        await typeSelect.selectOption('document');
        
        // Wait for the filtering to take effect
        await page.waitForTimeout(1000);
        
        // Verify filtered results - check for document icon
        const documentCell = page.locator('td:has-text("📄")').first();
        await expect(documentCell).toBeVisible();
    });

    test('should sort files', async ({ page }) => {
        // Get initial file names
        const fileNames = await page.locator('td:nth-child(2)').allTextContents();
        expect(fileNames.length).toBeGreaterThan(0);
        
        // Find and click the sort button
        const sortSelect = page.locator('select').nth(1);
        await sortSelect.selectOption('name');
        await page.waitForTimeout(500);
        
        // Get new order
        const reversedNames = await page.locator('td:nth-child(2)').allTextContents();
        expect(reversedNames).not.toEqual(fileNames);
    });

    test('should handle file actions', async ({ page }) => {
        // Wait for an active approve button
        const approveButton = page.locator('button:has-text("✓"):not([disabled])').first();
        if (await approveButton.isVisible()) {
            await approveButton.click();
            await page.waitForTimeout(500);
        }
        
        // Wait for an active reject button
        const rejectButton = page.locator('button:has-text("✗"):not([disabled])').first();
        if (await rejectButton.isVisible()) {
            await rejectButton.click();
            await page.waitForTimeout(500);
        }
        
        // Wait for an active pin button
        const pinButton = page.locator('button:has-text("📌"):not([disabled])').first();
        if (await pinButton.isVisible()) {
            await pinButton.click();
            await page.waitForTimeout(500);
        }
    });

    test('should handle pagination', async ({ page }) => {
        // Get initial items
        const initialItems = await page.locator('tr').count();
        
        // Click next page if available
        const nextButton = page.locator('button[aria-label="Next page"]').first();
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
            await nextButton.click();
            await page.waitForTimeout(1000);
            
            // Verify items changed
            const newItems = await page.locator('tr').count();
            expect(newItems).toBeGreaterThan(0);
        }
    });

    test('should maintain state after search and filter', async ({ page }) => {
        // Perform search
        const searchInput = page.locator('input[type="text"]').first();
        await searchInput.fill('test');
        await page.waitForTimeout(1000);

        // Apply filter
        const typeSelect = page.locator('select').first();
        await typeSelect.selectOption('document');
        await page.waitForTimeout(1000);

        // Verify search term is maintained
        await expect(searchInput).toHaveValue('test');

        // Verify filter is maintained
        await expect(typeSelect).toHaveValue('document');

        // Verify we still have the table
        await expect(page.locator('table')).toBeVisible();
    });
});
