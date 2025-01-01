import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $lib: "/src/lib",
      $styles: "/src/styles"
    }
  },
  server: { open: true }
});
