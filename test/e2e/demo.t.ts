import { expect, test } from "@playwright/test";

test("home page has increment button", async ({ page }) => {
  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: /increment/i })).toBeVisible();
});
