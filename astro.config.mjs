import { defineConfig } from 'astro/config';

import mdx from "@astrojs/mdx";

export default defineConfig({
    site: "https://alfredoit.dev",
    integrations: [
        mdx()
    ],
    i18n: {
        locales: ["es", "it"],
        defaultLocale: "en",
    },
});
