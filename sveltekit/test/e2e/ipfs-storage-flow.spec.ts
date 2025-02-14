import { test } from "@playwright/test";
import { createTestAccounts } from "../../src/lib/runes/burner-wallet";
// import { spawn } from "child_process";

// async function waitForServer(url: string, timeout = 30000): Promise<boolean> {
//   const start = Date.now();
//   while (Date.now() - start < timeout) {
//     try {
//       const response = await fetch(url);
//       if (response.ok) return true;
//     } catch {}
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//   }
//   return false;
// }

test.describe("IPFS Storage Flow", () => {
  let contentProvider: { address: string; privateKey: string };
  let moderator: { address: string; privateKey: string };
  let nodeRunner: { address: string; privateKey: string };
  let server: any;

  test.beforeAll(async () => {
    // // Start the development server
    // server = spawn("pnpm", ["dev"], {
    //   stdio: "pipe",
    //   shell: true
    // });

    // // Wait for the server to be ready
    // const isServerReady = await waitForServer("http://localhost:5173");
    // if (!isServerReady) {
    //   throw new Error("Server failed to start within timeout");
    // }

    // Create test accounts
    const accounts = await createTestAccounts();
    contentProvider = accounts.contentProvider;
    moderator = accounts.moderator;
    nodeRunner = accounts.nodeRunner;

    console.log("Test accounts created:", {
      contentProvider: contentProvider.address,
      moderator: moderator.address,
      nodeRunner: nodeRunner.address
    });
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the app's homepage with longer timeout and wait for network idle
    await page.goto("http://localhost:5173", {
      timeout: 30000,
      waitUntil: "networkidle"
    });
  });

  test("Content Provider Flow", async ({ page }) => {
    console.log("Starting test...");

    console.log("Looking for connect button...");

    // Try to find the connect button
    const buttons = await page.$$("button");
    console.log("Found buttons:", await Promise.all(buttons.map((b) => b.textContent())));
    // Wait for and click the connect button
    await page.waitForSelector('button:has-text("Connect")', { timeout: 30000 });

    await page.click('button:has-text("Connect")');

    // Wait for BearbyWallet popup to appear
    const popup = await page.waitForEvent("popup");

    // Fill in the password in the BearbyWallet popup
    await popup.waitForSelector('input[type="password"]');
    // await popup.locator('input[type="password"]').fill('your-wallet-password');

    // // Click the confirm button in the popup
    // await popup.getByRole('button', { name: /confirm|connect/i }).click();

    // // Wait for the connection to be established
    // await page.waitForSelector('.wallet-connected', { timeout: 10000 });

    //     // Upload a file
    //     await page.getByTestId("upload-file-input").setInputFiles("test-files/sample.txt");
    //     await page.getByTestId("upload-submit").click();

    //     // Verify file appears in the list
    //     await expect(page.getByTestId("file-list")).toContainText("sample.txt");
    //     const uploadedCid = await page.getByTestId("file-cid").textContent();

    //     // Logout
    //     await page.getByTestId("disconnect-wallet").click();

    //     // 2. Moderator Flow
    //     // Login as moderator
    //     await page.getByTestId("connect-wallet").click();
    //     await page.getByTestId("address-input").fill(moderator.address);
    //     await page.getByTestId("private-key-input").fill(moderator.privateKey);
    //     await page.getByTestId("connect-button").click();

    //     // Navigate to moderation page
    //     await page.getByTestId("moderation-tab").click();

    //     // Find and approve the uploaded file
    //     await page.getByTestId("file-action-" + uploadedCid).click();
    //     await page.getByTestId("approve-button").click();

    //     // Verify file status changed to approved
    //     await expect(page.getByTestId("file-status-" + uploadedCid)).toHaveText("APPROVED");

    //     // Logout
    //     await page.getByTestId("disconnect-wallet").click();

    //     // 3. Node Runner Flow
    //     // Login as node runner
    //     await page.getByTestId("connect-wallet").click();
    //     await page.getByTestId("address-input").fill(nodeRunner.address);
    //     await page.getByTestId("private-key-input").fill(nodeRunner.privateKey);
    //     await page.getByTestId("connect-button").click();

    //     // Navigate to pinning page
    //     await page.getByTestId("pinning-tab").click();

    //     // Find and pin the approved file
    //     await page.getByTestId("pin-file-" + uploadedCid).click();

    //     // Verify file status changed to pinned
    //     await expect(page.getByTestId("file-status-" + uploadedCid)).toHaveText("PINNED");
    //   });

    //   test("rejection flow - upload and moderate", async ({ page }) => {
    //     // 1. Content Provider Flow
    //     // Login as content provider
    //     await page.getByTestId("connect-wallet").click();
    //     await page.getByTestId("address-input").fill(contentProvider.address);
    //     await page.getByTestId("private-key-input").fill(contentProvider.privateKey);
    //     await page.getByTestId("connect-button").click();

    //     // Upload a file
    //     await page.getByTestId("upload-file-input").setInputFiles("test-files/sample2.txt");
    //     await page.getByTestId("upload-submit").click();

    //     // Verify file appears in the list
    //     await expect(page.getByTestId("file-list")).toContainText("sample2.txt");
    //     const uploadedCid = await page.getByTestId("file-cid").textContent();

    //     // Logout
    //     await page.getByTestId("disconnect-wallet").click();

    //     // 2. Moderator Flow
    //     // Login as moderator
    //     await page.getByTestId("connect-wallet").click();
    //     await page.getByTestId("address-input").fill(moderator.address);
    //     await page.getByTestId("private-key-input").fill(moderator.privateKey);
    //     await page.getByTestId("connect-button").click();

    //     // Navigate to moderation page
    //     await page.getByTestId("moderation-tab").click();

    //     // Find and reject the uploaded file
    //     await page.getByTestId("file-action-" + uploadedCid).click();
    //     await page.getByTestId("reject-button").click();

    //     // Verify file status changed to rejected
    //     await expect(page.getByTestId("file-status-" + uploadedCid)).toHaveText("REJECTED");
  });
});
