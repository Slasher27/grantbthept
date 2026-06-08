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
    // Keystatic runs in `local` storage mode — it reads/writes the repo on disk, which
    // only works in `astro dev`. On a deployed (serverless) host its API 404s and the
    // admin can't function, so we ship it in dev ONLY: no broken, publicly-exposed
    // /keystatic in production. Content editing is local (dev + commit). Switching to
    // Keystatic Cloud later re-enables live editing (and needs a CSP exception for it).
    ...(isDev ? [keystatic()] : []),
    sitemap({
      // Keep the CMS admin and its API out of the sitemap.
      filter: (page) => !page.includes('/keystatic') && !page.includes('/api/keystatic'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  // No syntax highlighting: the default (Shiki) colours code via inline style attributes,
  // which our CSP (style-src without 'unsafe-inline') blocks. This is a fitness/nutrition
  // blog with no code blocks, so we disable it — keeping CSP strict. Rare code renders as
  // plain monospace (styled by Prose). Switch to 'prism' (class-based, CSP-safe) only if
  // code content is ever needed.
  markdown: { syntaxHighlight: false },
  // Content-Security-Policy via Astro's CSP API (specs/06). For static output Astro
  // emits a per-page <meta http-equiv> with SHA-256 hashes for its own bundled scripts
  // and <style> blocks (no 'unsafe-inline'). We use no inline style attributes and the
  // only inline <script> is JSON-LD (a data block, not script-src governed), so the
  // default policy is sufficient; images/fonts have no default-src restriction.
  security: { csp: true },
});
