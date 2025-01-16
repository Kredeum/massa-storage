import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "pnpm dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  },
  testDir: "test/e2e",
  testMatch: /(.+\.)?(t|spec)\.[jt]s/,
  use: {
    trace: "on-first-retry",
    video: "on-first-retry"
  },
  timeout: 60000,
  expect: {
    timeout: 10000
  }
});
