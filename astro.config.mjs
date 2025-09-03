import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://alfredoit.dev",
  integrations: [
    mdx(),
  ],
  i18n: {
    locales: ["en", "it"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      fallbackType: "rewrite",
    },
    falback: {
      it: "en",
    },
  },
});
