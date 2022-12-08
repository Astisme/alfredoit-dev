import { defineConfig } from 'astro/config';
import deno from "@astrojs/deno";

export default defineConfig({
  output: "server",
  adapter: deno(),
  // site: "https://www.alfredoit.dev",
  site: "http://localhost:3000",
  start: true
});
