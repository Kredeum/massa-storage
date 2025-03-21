import { expect, test } from "@playwright/test";
import { URL_TESTS } from "./common";

test("can pin file via FileUpload form", async ({ page }) => {
  const url = `${URL_TESTS}/kubo/pin-file`;

  await page.goto(url, { waitUntil: "networkidle" });

  await expect(page.getByText("/tests/kubo/pin-file")).toBeVisible();

  // The file input exists but is hidden (styled with a custom button)
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toHaveAttribute("accept", "*/*");
  await expect(fileInput).toHaveAttribute("multiple");

  // Wait for the upload to finish and CID to appear in the input field
  const cidInput = page.locator('input[placeholder="CID"]');
  await expect(cidInput).toBeVisible();
  await expect(cidInput).toHaveValue(/^$/, { timeout: 10000 });

  const uploadZone = page.getByRole("button", { name: "Click or drag and drop to upload files" });
  await expect(uploadZone).toBeVisible();

  // Upload 2 test files
  await fileInput.setInputFiles(["tests/e2e/test.1.txt", "tests/e2e/test.2.txt"]);

  // Wait for CID to be set and validate its format
  await expect(cidInput).toHaveValue(/^baf[0-9a-zA-Z]{56}$/, { timeout: 10000 });

  // Get and log the CID
  const cid = await cidInput.inputValue();
  console.info("Uploaded file CID:", cid);
});
// test.skip("can pin file via Pin button", async ({ page }) => {}
// test.skip("can upload files and store dirCid onchain", async ({ page }) => {});
