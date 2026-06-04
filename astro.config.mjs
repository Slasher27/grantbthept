// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.grantbthept.co.za',
  trailingSlash: 'always', // CRITICAL — every indexed URL ends in '/' (see specs/02)
  build: { format: 'directory' }, // emits /path/index.html → served as /path/
  // Static by default: every content page is prerendered. Only the Keystatic admin
  // (and future contact/newsletter endpoints) opt into on-demand rendering, served
  // as Netlify Functions via the adapter below — the "hybrid route" in specs/01.
  output: 'static',
  adapter: netlify(),
  integrations: [
    react(),
    mdx(),
    keystatic(),
    sitemap({
      // Keep the CMS admin and its API out of the sitemap.
      filter: (page) => !page.includes('/keystatic') && !page.includes('/api/keystatic'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
