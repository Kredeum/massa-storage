import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    include: ["tests/unit/**/*.{test,spec,t}.{js,ts}"]
  },
  resolve: {
    alias: {
      $env: resolve(__dirname, "./tests/unit/mocks/env"),
      $lib: resolve(__dirname, "./src/lib")
    }
  }
});
