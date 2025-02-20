import { expect, test } from "@playwright/test";

test("can connect and disconnect wallet", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await expect(page.locator("#button-connect")).toBeVisible();

  // no click needed, Massa Wallet connection is reactive with Massa Station

  await expect(page.locator("#button-refresh")).toBeVisible();
  await expect(page.locator("#button-disconnect")).toBeVisible();

  await expect(page.locator("#network-name")).toHaveText("buildnet");
  await expect(page.locator("#wallet-name")).toHaveText("MASSA WALLET");

  //  click needed to disconnect
  await page.locator("#button-disconnect").click();

  await expect(page.locator("#button-connect")).toBeVisible();
});
