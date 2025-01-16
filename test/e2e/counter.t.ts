import { test, expect } from "@playwright/test";

test.describe("Counter functionality", () => {
  test("should increment counter by 1", async ({ page }) => {
    // Navigate to the page and wait for network to be idle
    await page.goto("http://localhost:5173", { waitUntil: "networkidle" });

    // Wait for the page to be fully loaded
    await page.waitForLoadState("domcontentloaded");

    // Wait for the increment button to be visible
    const incrementButton = page.getByRole("button", { name: /increment/i });
    await expect(incrementButton).toBeVisible({ timeout: 10000 });

    // Click increment button
    await incrementButton.click();

    // Wait for the increment operation to complete
    await page.waitForTimeout(2000);
  });
});
