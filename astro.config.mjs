import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://alfredoit.dev",
  integrations: [
      mdx(),
      sitemap({
          filter: (page) => !page.includes('sponsor'),
          i18n: {
            defaultLocale: 'en',
            locales: {
              en: 'en',
              it: 'it',
            }
          },
      })
  ],
  i18n: {
    locales: ["en", "it"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      fallbackType: "rewrite",
    },
    fallback: {
      it: "en",
    },
  },
});
