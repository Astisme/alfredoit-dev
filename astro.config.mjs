import { defineConfig } from 'astro/config';

import deno from "@deno/astro-adapter";
import mdx from "@astrojs/mdx";
//import php from "astro-php";


export default defineConfig({
  output: "server",
  adapter: deno(),
  integrations: [
    //php(),
    mdx()
  ]
});
