import { defineConfig } from 'astro/config';
import deno from "@astrojs/deno";

// https://astro.build/config
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: deno(),
  integrations: [mdx()]
});