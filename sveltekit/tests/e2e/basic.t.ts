import { expect, test } from "@playwright/test";
import { URL_APP } from "./common";

test("home page has connect button and log invite", async ({ page }) => {
  await page.goto(URL_APP);

  await expect(page.getByRole("button", { name: "Connect" })).toBeVisible();
  await expect(page.locator("#button-connect")).toHaveText("Connect");
  await expect(page.locator("#text-log")).toContainText("Please Connect");
});
