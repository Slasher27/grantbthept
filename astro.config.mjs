// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// Keystatic's admin UI calls its local API without a trailing slash, which
// trailingSlash:'always' rejects (admin shows "Unable to load collection").
// The admin only runs in `astro dev` (local storage), so relax to 'ignore' in
// dev only. The production BUILD keeps 'always' so deployed/indexed URLs are
// spec-compliant (specs/02) — deployment behaviour is unchanged.
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  site: 'https://www.grantbthept.co.za',
  trailingSlash: isDev ? 'ignore' : 'always', // build = 'always' (CRITICAL, specs/02)
  build: { format: 'directory' }, // emits /path/index.html → served as /path/
  // Static by default: every content page is prerendered. Only the Keystatic admin
  // (and future contact/newsletter endpoints) opt into on-demand rendering, served
  // as Netlify Functions via the adapter below — the "hybrid route" in specs/01.
  output: 'static',
  adapter: netlify(),
  // Self-hosted brand font (specs/04, 06). The Google provider downloads Poppins at
  // build time and serves it from our own origin — no third-party font CDN at runtime.
  // Poppins is the live brand font; 3 weights only (body / semibold UI / bold headings).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      weights: [400, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],
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
