import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess({
    postcss: {
      configFileDirectory: "."
    },
    style: ({ content, attributes }) => {
      if (!attributes.lang || attributes.lang === "postcss") {
        return {
          code: content,
          dependencies: []
        };
      }
      return null;
    }
  }),

  kit: {
    adapter: adapter()
  }
};

export default config;
