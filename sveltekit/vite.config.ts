import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [sveltekit(), nodePolyfills()],
  resolve: {
    alias: {
      $lib: "/src/lib",
      $styles: "/src/styles",
      lodash: "lodash-es"
    }
  },
  server: { open: true },
  optimizeDeps: {
    include: ['jszip'],
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  define: {
    global: {}
  },
  build: {
    rollupOptions: {
      external: ["lodash"]
    }
  },
  assetsInclude: ["**/*.svg"]
});
