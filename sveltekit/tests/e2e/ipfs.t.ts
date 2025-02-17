import { expect, test } from "@playwright/test";

test("home page has button", async ({ page }) => {
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await expect(page.getByRole("button")).toBeVisible();

  await expect(page.locator("#text-log:has-text('Please log')")).toBeVisible();
});
