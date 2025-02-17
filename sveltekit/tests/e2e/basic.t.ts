import { expect, test } from "@playwright/test";

test("home page has connect button and log invite", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await expect(page.getByRole("button", { name: "Connect" })).toBeVisible();
  await expect(page.locator("#button-connect")).toHaveText("Connect");
  await expect(page.locator("#text-log")).toContainText("Please Connect");
});
