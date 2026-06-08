# 08 — Build Plan, Gates & Launch

Phased so each milestone ships something verifiable. **Acceptance gates** require human
sign-off before proceeding. Nothing in a later phase starts while an earlier gate is open.

## Phase 0 — Discovery & inventory  → *Gate A*

- [ ] Export full indexed URL set: GSC Pages report + live `sitemap.xml` + crawl. Build
      the authoritative URL map (extends the table in `02`).
- [ ] Export all post content + images from WordPress.
- [ ] **Sample the live colour palette + fonts** (`04`); record real tokens.
- [ ] Collect `[VERIFY]` business facts from Grant (address/geo, hours, email,
      newsletter provider, social, REPSSA profile link). (Phone is not published.)
- **Gate A:** URL map reconciled and signed off; brand tokens confirmed; facts gathered.

## Phase 1 — Foundation

- [ ] Scaffold Astro 6.4, `trailingSlash:'always'`, `build.format:'directory'`, Tailwind
      v4 `@theme` tokens, Fonts API, CSP, sitemap, MDX, Keystatic.
- [ ] `BaseLayout`, `BaseHead`, header/nav (incl. accessible mobile menu), footer, UI
      primitives (`Section/Container/Button/Prose/Card/Badge`).
- [ ] `lib/` helpers: dates, slug/path builders, schema builders, related-content,
      category registry.
- [ ] CI: build + Lighthouse CI + axe + link-check + URL-parity check wired to budgets.

## Phase 2 — Content collections & migration

- [ ] Define `posts`, `testimonials` collections + singletons with Zod schemas (`03`).
- [ ] Migrate every post to clean MDX with **exact original slug + pubDate** (`02`/`03`).
      Heading hierarchy fixed, internal links re-pointed, images re-imported.
- [ ] Keystatic configured and tested (Grant can create a post end-to-end).
- **Gate B:** every migrated post resolves at its exact original date-based URL.

## Phase 3 — Pages

- [ ] Home (all sections + anchors), `/news/` + pagination, post template, category
      (incl. nested), author, `/testimonials/`, `/privacy-policy/`, `/404`.  (`07`)
- [ ] Structured data on every page type; validate in Rich Results Test. (`05`)
- [ ] Contact + newsletter endpoints (Resend / provider) with Altcha + honeypot +
      POPIA consent; success/error states.

## Phase 4 — Optimisation & QA

- [ ] Hit all `06` budgets on every template (perf, a11y, SEO, best-practices, CWV).
- [ ] Manual keyboard + screen-reader pass. Cross-browser + 320→1920 responsive check.
- [ ] Full structured-data + metadata audit; OG/Twitter previews verified.
- **Gate C:** all budgets green in CI; a11y manual pass complete.

## Phase 5 — Launch  → *Gate D (go/no-go)*

Pre-cutover:
- [ ] **URL parity report**: every old URL → `200` (same path) or single `301` to live
      `200`. Zero 404s. Zero legacy WP URL forms serving duplicate content. (`02`)
- [ ] `sitemap-index.xml`, `robots.txt`, `/rss.xml` correct (trailing slashes, admin
      excluded). Canonicals self-referential.
- [ ] DNS plan: apex → `www` 301; TLS/HSTS; cache headers.
- [ ] Analytics (cookieless) live; GSC verified for the property.

Cutover:
- [ ] Deploy to Netlify; point DNS.
- [ ] Submit `sitemap-index.xml` in GSC; run "Validate fix" on the Pages report.
- [ ] Spot-check top 20 indexed URLs live (200/301 as expected).

Post-launch (first 8 weeks):
- [ ] Weekly GSC monitoring: Coverage, Core Web Vitals, top-query positions. Watch for the
      prior-migration failure mode (duplicate/old URLs reappearing).
- [ ] Fix any crawl errors immediately; re-validate.
- [ ] Query ChatGPT/Perplexity/Google AI Mode for Grant's key topics; log baseline AEO
      citations and iterate content (`05`).

## Standing acceptance gates (apply throughout)

- Any change to **redirects, sitemap, robots, canonical, or a post's slug** → human gate.
- Any **`[VERIFY]`** content (facts, prices, claims) → human gate before it ships.
- Any **new dependency** → justify against existing capability in the commit message.
- Any **testimonial** → confirm documented consent (`03`) before publish.
