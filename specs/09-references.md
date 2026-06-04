# 09 — Documentation References

Authoritative documentation for every part of this stack. **Claude Code: when you're
unsure how an API works, consult the official docs below before relying on memory** —
versions move and training data goes stale. Versions are pinned to `package.json`; if a
doc page describes a different major version, defer to the version we've pinned.

> Tip: when fetching a doc, prefer the version-matched page. For Astro that's the current
> docs site (tracks latest stable); for Tailwind, the v4 docs specifically (v3 syntax is
> different and must not be used here).

## Core framework

| Tool | Version | Docs | Use for |
|------|---------|------|---------|
| Astro | `^6.4` | <https://docs.astro.build> | Project config, routing, layouts, components. |
| — Configuration | | <https://docs.astro.build/en/reference/configuration-reference/> | `trailingSlash`, `build.format`, `site`, `redirects`, `image`. |
| — Routing (dynamic) | | <https://docs.astro.build/en/guides/routing/> | `getStaticPaths`, `[...rest]`, the date-based + nested-category routes. |
| — Pagination | | <https://docs.astro.build/en/reference/api-reference/#paginate> | `/news/page/N/`. |
| — Content collections | | <https://docs.astro.build/en/guides/content-collections/> | `src/content.config.ts`, `glob()` loader, schemas. |
| — Images | | <https://docs.astro.build/en/guides/images/> | `<Image>`/`<Picture>`, formats, responsive `widths`/`sizes`. |
| — Fonts API | | <https://docs.astro.build/en/reference/experimental-flags/fonts/> | Self-hosting fonts (per 04/06). |
| — CSP | | <https://docs.astro.build/en/reference/experimental-flags/csp/> | Content-Security-Policy (per 06). |

## Styling

| Tool | Version | Docs | Use for |
|------|---------|------|---------|
| Tailwind CSS | `^4` | <https://tailwindcss.com/docs> | **v4 only.** Utilities, `@theme`, CSS-first config. |
| — Vite plugin | | <https://tailwindcss.com/docs/installation/using-vite> | The `@tailwindcss/vite` setup (no `tailwind.config.js`). |
| — Theme variables | | <https://tailwindcss.com/docs/theme> | The `@theme` token block in `global.css` (per 04). |

## CMS — Keystatic

| Tool | Version | Docs | Use for |
|------|---------|------|---------|
| Keystatic | `core ^0.5`, `astro ^5` | <https://keystatic.com/docs> | `keystatic.config.ts`, collections, singletons. |
| — Fields reference | | <https://keystatic.com/docs/fields> | Field types for the schemas (text, slug, date, image, mdx, array). |
| — Astro setup | | <https://keystatic.com/docs/installation-astro> | Integration, admin routes, React peer. |
| — GitHub mode | | <https://keystatic.com/docs/github-mode> | Production auth via GitHub App (per the auth decision). |
| — Keystatic Cloud | | <https://keystatic.com/docs/cloud> | Email-invite auth for editors without GitHub (recommended for Grant). |

## Content, data & integrations

| Tool | Version | Docs | Use for |
|------|---------|------|---------|
| Zod | (via Astro) | <https://zod.dev> | Collection schema validation. |
| @astrojs/mdx | `^4.3` | <https://docs.astro.build/en/guides/integrations-guide/mdx/> | MDX in posts/testimonials. |
| @astrojs/sitemap | `^3.6` | <https://docs.astro.build/en/guides/integrations-guide/sitemap/> | `sitemap-index.xml`, filtering `/keystatic`. |
| @astrojs/react | `^4.4` | <https://docs.astro.build/en/guides/integrations-guide/react/> | Required peer for Keystatic's admin UI. |
| React | `^19` | <https://react.dev/reference/react> | Only relevant inside Keystatic's admin. |
| sharp | `^0.34` | <https://sharp.pixelplumbing.com> | Image processing backend for Astro Image. |
| Alpine.js | `^3` (add in Phase 3) | <https://alpinejs.dev/start-here> | Small interactivity: nav, before/after slider, form UX. |

## Deploy & hosting (Netlify)

| Tool | Docs | Use for |
|------|------|---------|
| @astrojs/netlify | <https://docs.astro.build/en/guides/integrations-guide/netlify/> | The adapter; SSR function for Keystatic routes. |
| Netlify docs | <https://docs.netlify.com> | Build settings, env vars, deploys. |
| Netlify redirects | <https://docs.netlify.com/routing/redirects/> | `_redirects` rules / 301s (per 02). |
| Vercel (if chosen instead) | <https://vercel.com/docs> and <https://docs.astro.build/en/guides/integrations-guide/vercel/> | Alternative host + adapter. |

## SEO, AEO & structured data

| Topic | Docs | Use for |
|-------|------|---------|
| Schema.org | <https://schema.org/docs/full.html> | Type/property definitions (Person, LocalBusiness, BlogPosting, Review, FAQPage, BreadcrumbList). |
| Google structured data | <https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data> | What Google supports + required/recommended fields. |
| Rich Results Test | <https://search.google.com/test/rich-results> | Validate JSON-LD on every page type (per 05). |
| Google Search Essentials | <https://developers.google.com/search/docs/essentials> | Crawlability, canonicalisation, sitemaps. |
| Search Console help | <https://support.google.com/webmasters> | Sitemap submission, Pages report, "Validate fix" (per 08). |

## Performance & accessibility

| Topic | Docs | Use for |
|-------|------|---------|
| Core Web Vitals | <https://web.dev/articles/vitals> | LCP / INP / CLS definitions + targets (per 06). |
| INP | <https://web.dev/articles/inp> | The metric that replaced FID. |
| Lighthouse | <https://developer.chrome.com/docs/lighthouse/overview> | Auditing against the 06 budgets. |
| WCAG 2.2 | <https://www.w3.org/TR/WCAG22/> | The AA success criteria. |
| WAI-ARIA APG | <https://www.w3.org/WAI/ARIA/apg/patterns/> | Accessible patterns (disclosure nav, etc.). |
| axe-core | <https://github.com/dequelabs/axe-core> | Automated a11y checks in CI. |

## Compliance & services

| Topic | Docs | Use for |
|-------|------|---------|
| POPIA (South Africa) | <https://popia.co.za> | Privacy-policy content, consent, data-subject rights (per 05). |
| Resend (email) | <https://resend.com/docs> | Contact-form delivery (per 01). |
| Cloudflare Turnstile | <https://developers.cloudflare.com/turnstile/> | Form spam protection (host-agnostic; usable on Netlify). |

---

**Maintenance:** when a dependency's major version changes in `package.json`, update its
row here and re-check the linked docs for breaking changes before upgrading.
