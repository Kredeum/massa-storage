import { expect, test } from "@playwright/test";
import { URL_TESTS } from "./common";

test("can connect and disconnect wallet", async ({ page }) => {
  const url = `${URL_TESTS}/burner?key=${process.env.PRIVATE_KEY_UPLOADER}`;

  await page.goto(url);

  await expect(page.locator("#button-connect")).toBeVisible();

  // no click needed, Massa Wallet connection is reactive with Massa Station

  await expect(page.locator("#button-refresh")).toBeVisible();
  await expect(page.locator("#button-disconnect")).toBeVisible();

  await expect(page.locator("#network-name")).toHaveText("buildnet");
  await expect(page.locator("#wallet-name")).toHaveText("Burner Wallet");

  //  click needed to disconnect
  await page.locator("#button-disconnect").click();

  await expect(page.locator("#button-connect")).toBeVisible();
});

test("can connect with 3 wallets", async ({ page }) => {
  const url1 = `${URL_TESTS}/burner?key=${process.env.PRIVATE_KEY_UPLOADER}`;
  await page.goto(url1);
  await expect(page.locator("#button-disconnect")).toBeVisible();
  await page.locator("#button-disconnect").click();
  await expect(page.locator("#button-connect")).toBeVisible();

  const url2 = `${URL_TESTS}/burner?key=${process.env.PRIVATE_KEY_MODERATOR}`;
  await page.goto(url2);
  await expect(page.locator("#button-disconnect")).toBeVisible();
  await page.locator("#button-disconnect").click();
  await expect(page.locator("#button-connect")).toBeVisible();

  const url3 = `${URL_TESTS}/burner?key=${process.env.PRIVATE_KEY_PINNER}`;
  await page.goto(url3);
  await expect(page.locator("#button-disconnect")).toBeVisible();
  await page.locator("#button-disconnect").click();
  await expect(page.locator("#button-connect")).toBeVisible();
});
