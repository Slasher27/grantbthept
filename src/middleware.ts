import { defineMiddleware } from 'astro:middleware';

// Per-route CSP relaxation for Keystatic ONLY.
//
// The site-wide strict CSP (astro.config.mjs `security.csp`) emits style-src without
// 'unsafe-inline'. Keystatic's admin UI is built with runtime CSS-in-JS — it injects
// <style> tags from JS at request time, which can't be pre-hashed — so the strict policy
// blocks them and the admin renders completely unstyled. Astro's CSP is global and can't
// be scoped per route, so we override the header here for the /keystatic + /api/keystatic
// routes (the only on-demand routes; every content page is prerendered static and never
// hits this middleware). Those routes are noindex (robots disallow + excluded from the
// sitemap) and gated behind Keystatic Cloud auth, so a relaxed policy scoped to them is an
// acceptable, contained trade-off — the strict policy still governs every public page.
export const onRequest = defineMiddleware(async ({ url }, next) => {
  const response = await next();

  if (url.pathname.startsWith('/keystatic') || url.pathname.startsWith('/api/keystatic')) {
    response.headers.set(
      'content-security-policy',
      [
        "default-src 'self'",
        // CSS-in-JS injects inline <style>; Keystatic's UI font comes from Google Fonts.
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        // Keystatic's own bundle (served from our origin) + its inline hydration script.
        "script-src 'self' 'unsafe-inline'",
        // Uploaded/preview images come from the Cloud/GitHub over https, plus data/blob.
        "img-src 'self' data: blob: https:",
        // Cloud auth + GitHub content API.
        "connect-src 'self' https:",
      ].join('; '),
    );
  }

  return response;
});
