import { expect, test } from "@playwright/test";
import { Account } from "@massalabs/massa-web3";
import { URL_APP } from "./common";

test("can add and remove moderator", async ({ page }) => {
  const account: Account = await Account.generate();
  const testAddress = account.address.toString();
  console.info("testAddress:", testAddress);

  const url = `${URL_APP}/moderators?key=${process.env.PRIVATE_KEY_DEPLOYER}`;

  await page.goto(url, { waitUntil: "networkidle" });
  await expect(page.locator("#button-disconnect")).toBeVisible();
  await expect(page.locator("#button-moderator-add")).toBeVisible();

  await page.locator("#input-moderator-address").fill(testAddress);
  await expect(page.locator("#input-moderator-address")).toHaveValue(testAddress);
  await page.locator("#button-moderator-add").click();

  const moderatorTr = page.locator(`tr:has-text("${testAddress}")`);
  await expect(moderatorTr).toBeVisible({ timeout: 30000 });

  const moderatorDeleteButton = moderatorTr.locator("button");
  await expect(moderatorDeleteButton).toBeVisible();
  await moderatorDeleteButton.click();

  await expect(page.locator(`tr:has-text("${testAddress}")`)).not.toBeVisible({ timeout: 30000 });
});
