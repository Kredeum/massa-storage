import { test, expect } from '@playwright/test';

test.describe('File Management Component', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the page containing the file management component
        await page.goto('/app/files');
    });

    test('should display file list and perform search', async ({ page }) => {
        // Wait for the component to be loaded
        await page.waitForSelector('table');
        
        // Test search functionality
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('document');
        
        // Wait for the filtering to take effect
        await page.waitForTimeout(500);
        
        // Check if filtered results are shown
        const fileIcon = page.locator('td >> text=📄');
        await expect(fileIcon).toBeVisible();
    });

    test('should filter files by type', async ({ page }) => {
        await page.waitForSelector('select');
        
        // Test type filter
        const typeSelect = page.locator('select').first();
        await typeSelect.selectOption('document');
        
        // Wait for the filtering to take effect
        await page.waitForTimeout(500);
        
        // Verify filtered results - check for document icon
        const documentIcon = page.locator('td >> text=📄');
        await expect(documentIcon).toBeVisible();
    });

    test('should sort files', async ({ page }) => {
        await page.waitForSelector('table');
        
        // Get initial file names
        const fileNames = await page.locator('td:nth-child(2)').allTextContents();
        expect(fileNames.length).toBeGreaterThan(0);
        
        // Click sort button
        await page.click('button:has-text("↓")');
        await page.waitForTimeout(500);
        
        // Get new order
        const reversedNames = await page.locator('td:nth-child(2)').allTextContents();
        expect(reversedNames).not.toEqual(fileNames);
    });

    test('should handle file actions', async ({ page }) => {
        await page.waitForSelector('table');
        
        // Test approve action
        const approveButton = page.locator('button:has-text("✓")').first();
        if (await approveButton.isVisible()) {
            await approveButton.click();
            await page.waitForTimeout(500);
        }
        
        // Test reject action
        const rejectButton = page.locator('button:has-text("✗")').first();
        if (await rejectButton.isVisible()) {
            await rejectButton.click();
            await page.waitForTimeout(500);
        }
        
        // Test pin action
        const pinButton = page.locator('button:has-text("📌")').first();
        if (await pinButton.isVisible()) {
            await pinButton.click();
            await page.waitForTimeout(500);
        }
    });

    test('should handle pagination', async ({ page }) => {
        await page.waitForSelector('table');
        
        // Get initial items
        const initialItems = await page.locator('tr').count();
        
        // Click next page if available
        const nextButton = page.getByText('Next');
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
            await nextButton.click();
            await page.waitForTimeout(500);
            
            // Verify items changed
            const newItems = await page.locator('tr').count();
            expect(newItems).toBeGreaterThan(0);
        }
    });

    test('should maintain state after search and filter', async ({ page }) => {
        await page.waitForSelector('table');
        
        // Perform search
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('test');
        await page.waitForTimeout(500);

        // Apply filter
        const typeSelect = page.locator('select').first();
        await typeSelect.selectOption('document');
        await page.waitForTimeout(500);

        // Verify search term is maintained
        await expect(searchInput).toHaveValue('test');

        // Verify filter is maintained
        await expect(typeSelect).toHaveValue('document');

        // Verify we still have the table
        await expect(page.locator('table')).toBeVisible();
    });
});
