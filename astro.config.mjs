// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.grantbthept.co.za',
  // 'ignore', NOT 'always' — a deliberate, verified deviation from specs/02 (gated +
  // approved 2026-07-16). Keystatic's two catch-all routes (/keystatic/[...params] and
  // /api/keystatic/[...params]) call themselves WITHOUT a trailing slash; 'always' made
  // Astro 404 them, which broke the Cloud OAuth login (/keystatic/cloud/oauth/callback).
  // Crucially, 'always' was never what protected the indexed URLs: `build.format:'directory'`
  // + Netlify's static directory handling issue the 301 (/news → /news/) — verified live,
  // and Astro's 'always' 404s rather than 301s, so it never provided that redirect at all.
  // It only governed the on-demand routes, i.e. only Keystatic. Verified under 'ignore':
  // sitemap + canonicals keep trailing slashes, and every legacy URL still resolves.
  trailingSlash: 'ignore',
  build: { format: 'directory' }, // emits /path/index.html → served as /path/
  // Static by default: every content page is prerendered. Only the Keystatic admin
  // (and future contact/newsletter endpoints) opt into on-demand rendering, served
  // as Netlify Functions via the adapter below — the "hybrid route" in specs/01.
  output: 'static',
  adapter: netlify(),
  // URL parity (specs/02). The old WP site's wp-sitemap exposed one orphan Elementor
  // auto-page with no successor on the new site; single-hop 301 → home so the indexed
  // URL never 404s at cutover. All other old URLs map 1:1 (verified against wp-sitemap).
  redirects: {
    '/elementor-landing-page-719/': '/',
  },
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
    // Keystatic now runs in `cloud` storage mode (keystatic.config.ts), so the admin works
    // deployed — it talks to Keystatic Cloud + GitHub rather than the local disk. It therefore
    // ships in production too, which is what lets Grant edit the live site by email invite.
    keystatic(),
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
  // Content-Security-Policy via Astro's CSP API (specs/06). For static output Astro emits
  // a per-page <meta http-equiv> with SHA-256 hashes for its own bundled scripts and
  // <style> blocks (no 'unsafe-inline'). We add googletagmanager.com to script-src so the
  // consent-gated Google Analytics tag can load (see CookieConsent.astro). GA's data calls
  // go to google-analytics.com via connect/img, which stay unrestricted (no default-src is
  // set). 'self' is kept so our own hashed scripts still run; auto-hashes still apply.
  security: {
    csp: {
      scriptDirective: {
        resources: ["'self'", 'https://www.googletagmanager.com'],
      },
    },
  },
});
