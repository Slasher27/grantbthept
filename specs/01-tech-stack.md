# 01 — Tech Stack

## Decision: Astro (static) + Tailwind v4 + Keystatic

**Why Astro over PHP/Next.js for this site:** the site is ~95% content (marketing page +
blog + testimonials) with tiny interactivity. Astro ships zero JS by default, gives
best-in-class Core Web Vitals out of the box, has first-class Content Collections + MDX
for the blog, and native control over output URLs (essential for the index-preservation
goal). Next.js is heavier than needed and invites client-side bloat; PHP means
re-introducing a server runtime and a CMS to maintain. Astro static + a git-based CMS is
the leanest path to all five of the stated goals.

## Versions (pin these)

| Tool | Version | Notes |
|------|---------|-------|
| Astro | `^6.4` | Latest stable line. Uses built-in Fonts API + CSP API + unified content layer. |
| Tailwind CSS | `^4` | Via `@tailwindcss/vite` (no PostCSS config, no `tailwind.config.js`). |
| `@astrojs/mdx` | latest for Astro 6 | Blog + testimonial bodies. |
| `@astrojs/sitemap` | latest for Astro 6 | Auto sitemap (configured for trailing slash). |
| Keystatic | latest | Git-based CMS; visual editor for Grant, writes Markdown/MDX to repo. |
| Alpine.js | `^3` | Tiny islands of interactivity only (nav, slider, form UX). |
| Node | `^22 LTS` | Build/runtime for tooling. |

> Do **not** add a UI component library, CSS-in-JS, a state manager, jQuery, or a second
> animation library. Tailwind v4 + a little Alpine + CSS is the entire front-end budget.

## astro.config.mjs (authoritative shape)

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.grantbthept.co.za',
  trailingSlash: 'always',           // CRITICAL — see 02
  build: { format: 'directory' },    // emits /path/index.html  → served as /path/
  output: 'static',                  // Keystatic admin runs in a hybrid route; see below
  integrations: [mdx(), sitemap(), keystatic()],
  vite: { plugins: [tailwindcss()] },
  image: { /* see 06 for formats/sizes */ },
  experimental: { /* enable CSP per 06 */ },
});
```

> The `www.` host is canonical (matches current indexed URLs). Configure the host/DNS to
> 301 the apex `grantbthept.co.za` → `https://www.grantbthept.co.za/`.

## CMS: Keystatic (git-based)

Grant must be able to add blog posts and testimonials without touching code. Keystatic
gives a visual admin UI that commits Markdown/MDX + images straight to the Git repo — no
external database, no monthly service, content lives with the code, fully versioned.

- Admin at `/keystatic` (protected; not indexed — disallow in robots, `noindex`).
- Collections mirror the content model in `03`: `posts`, `testimonials`, plus singletons
  for `services`, `siteSettings`, `homepage`.
- Image uploads routed to `src/assets/` (so Astro Image can optimise them).

**Alternatives (only if Grant prefers a hosted dashboard):** TinaCMS (now Astro-default,
visual editing) or Decap CMS. Same git-based model. Default to Keystatic; do not run
more than one.

## Forms (static-site friendly — see 07 for UX)

Two forms exist: **contact** and **newsletter**. Static hosting can't process POSTs alone.

- **Contact form** → **Astro on-demand endpoint** (a Netlify Function via the
  `@astrojs/netlify` adapter) that emails via **Resend**. Spam protection: hidden honeypot
  field + a privacy-friendly, cookieless CAPTCHA (**Altcha** preferred — open-source,
  self-hostable, no cookies; hCaptcha as a fallback). POPIA consent checkbox required
  (see 05/07).
- **Newsletter** → POST to the email provider Grant uses (`[VERIFY]` — Mailchimp /
  Buttondown / MailerLite). Double opt-in. Single email field + consent.

Do not store submissions in any database we own unless Grant asks; email-and-forget keeps
the POPIA footprint minimal.

## Hosting & CI

- **Netlify** (chosen host): free tier, global edge CDN (good latency from ZA), Netlify
  Functions for the contact endpoint and the Keystatic admin route, automatic preview
  deploys per PR. Astro 6 support via `@astrojs/netlify` is first-class.
  Deploy is `output: 'static'` + the Netlify adapter: content pages prerender, only the
  on-demand routes (`/keystatic`, contact/newsletter endpoints) run as Functions.
- **CI gate:** GitHub Actions runs build + Lighthouse CI + link-check on every PR.
  Merge blocked if budgets in `06` fail. See `08`.

## Repo layout

```
src/
  assets/            # images processed by Astro Image
  components/
    layout/          # Header, Footer, BaseHead, Nav
    sections/        # Hero, About, Services, BlogPreview, Credentials, ContactCTA
    blog/            # PostCard, CategoryBadge, Pagination, ShareLinks
    testimonials/    # TransformationCard, BeforeAfter
    ui/              # Button, Section, Container, Prose
  content/           # content collections (posts, testimonials, ...) + config.ts
  layouts/           # BaseLayout, PageLayout, PostLayout, ArchiveLayout
  pages/             # routes (see 02)
  styles/            # global.css (the single @theme token source)
  lib/               # tiny helpers (dates, slugs, schema builders) — DRY home
keystatic.config.ts
astro.config.mjs
```
