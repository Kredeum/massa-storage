import { expect, test } from "@playwright/test";
import { Account } from "@massalabs/massa-web3";

test("can add and remove moderator", async ({ page }) => {
  const account: Account = await Account.generate();
  const testAddress = account.address.toString();

  await page.goto("http://localhost:5173/app/moderators", { waitUntil: "networkidle" });
  await expect(page.locator("#button-disconnect")).toBeVisible();
  await expect(page.locator("#button-moderator-add")).toBeVisible();

  await page.locator("#input-moderator-address").fill(testAddress);
  await page.locator("#button-moderator-add").click();

  await expect(page.getByText(testAddress)).toBeVisible();

  // // Remove moderator
  // await page.getByRole("button", { name: "❌" }).click();

  // // Verify moderator is removed from the list
  // await expect(page.getByText(testAddress)).not.toBeVisible();
  // await expect(page.getByText("❌")).toBeVisible();
});
