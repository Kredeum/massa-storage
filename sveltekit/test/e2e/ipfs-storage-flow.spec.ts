import { test, expect } from '@playwright/test';
import { createTestAccounts } from '../../src/lib/runes/burner-wallet';

test.describe('IPFS Storage Flow', () => {
  let contentProvider: { address: string; privateKey: string };
  let moderator: { address: string; privateKey: string };
  let nodeRunner: { address: string; privateKey: string };

  test.beforeAll(async () => {
    const accounts = await createTestAccounts();
    contentProvider = accounts.contentProvider;
    moderator = accounts.moderator;
    nodeRunner = accounts.nodeRunner;

    console.log('Test accounts created:', {
      contentProvider: contentProvider.address,
      moderator: moderator.address,
      nodeRunner: nodeRunner.address
    });
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the app's homepage
    await page.goto('/');
  });

  test('complete e2e flow - upload, moderate, and pin', async ({ page }) => {
    // 1. Content Provider Flow
    // Login as content provider
    await page.getByTestId('connect-wallet').click();
    await page.getByTestId('address-input').fill(contentProvider.address);
    await page.getByTestId('private-key-input').fill(contentProvider.privateKey);
    await page.getByTestId('connect-button').click();

    // Upload a file
    await page.getByTestId('upload-file-input').setInputFiles('test-files/sample.txt');
    await page.getByTestId('upload-submit').click();
    
    // Verify file appears in the list
    await expect(page.getByTestId('file-list')).toContainText('sample.txt');
    const uploadedCid = await page.getByTestId('file-cid').textContent();
    
    // Logout
    await page.getByTestId('disconnect-wallet').click();

    // 2. Moderator Flow
    // Login as moderator
    await page.getByTestId('connect-wallet').click();
    await page.getByTestId('address-input').fill(moderator.address);
    await page.getByTestId('private-key-input').fill(moderator.privateKey);
    await page.getByTestId('connect-button').click();

    // Navigate to moderation page
    await page.getByTestId('moderation-tab').click();
    
    // Find and approve the uploaded file
    await page.getByTestId('file-action-' + uploadedCid).click();
    await page.getByTestId('approve-button').click();
    
    // Verify file status changed to approved
    await expect(page.getByTestId('file-status-' + uploadedCid)).toHaveText('APPROVED');
    
    // Logout
    await page.getByTestId('disconnect-wallet').click();

    // 3. Node Runner Flow
    // Login as node runner
    await page.getByTestId('connect-wallet').click();
    await page.getByTestId('address-input').fill(nodeRunner.address);
    await page.getByTestId('private-key-input').fill(nodeRunner.privateKey);
    await page.getByTestId('connect-button').click();

    // Navigate to pinning page
    await page.getByTestId('pinning-tab').click();
    
    // Find and pin the approved file
    await page.getByTestId('pin-file-' + uploadedCid).click();
    
    // Verify file status changed to pinned
    await expect(page.getByTestId('file-status-' + uploadedCid)).toHaveText('PINNED');
  });

  test('rejection flow - upload and moderate', async ({ page }) => {
    // 1. Content Provider Flow
    // Login as content provider
    await page.getByTestId('connect-wallet').click();
    await page.getByTestId('address-input').fill(contentProvider.address);
    await page.getByTestId('private-key-input').fill(contentProvider.privateKey);
    await page.getByTestId('connect-button').click();

    // Upload a file
    await page.getByTestId('upload-file-input').setInputFiles('test-files/sample2.txt');
    await page.getByTestId('upload-submit').click();
    
    // Verify file appears in the list
    await expect(page.getByTestId('file-list')).toContainText('sample2.txt');
    const uploadedCid = await page.getByTestId('file-cid').textContent();
    
    // Logout
    await page.getByTestId('disconnect-wallet').click();

    // 2. Moderator Flow
    // Login as moderator
    await page.getByTestId('connect-wallet').click();
    await page.getByTestId('address-input').fill(moderator.address);
    await page.getByTestId('private-key-input').fill(moderator.privateKey);
    await page.getByTestId('connect-button').click();

    // Navigate to moderation page
    await page.getByTestId('moderation-tab').click();
    
    // Find and reject the uploaded file
    await page.getByTestId('file-action-' + uploadedCid).click();
    await page.getByTestId('reject-button').click();
    
    // Verify file status changed to rejected
    await expect(page.getByTestId('file-status-' + uploadedCid)).toHaveText('REJECTED');
  });
});
