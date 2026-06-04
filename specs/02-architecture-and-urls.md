# 02 — Architecture & URL Preservation  ⚠️ CRITICAL

The previous migration mistake to avoid: old URLs left indexed alongside new ones,
creating duplication and a traffic drop. The rule here is simple: **the URL surface of
the new site is a superset of the old one. Nothing moves silently.**

## Trailing slash — `always` (not `never`)

Every indexed URL on the live site ends in `/`. Therefore:

```
trailingSlash: 'always'
build: { format: 'directory' }
```

This is a deliberate departure from the house `never` convention. Do not "fix" it.
A request to `/news` (no slash) must `301` → `/news/`, never serve a duplicate.

## URL inventory & mapping

> **First task before coding:** export the *complete* indexed URL list from Google
> Search Console (Pages report) + the live `sitemap.xml` + a crawl (Screaming Frog or
> equivalent). The table below is the known structure from inspection; the GSC export is
> the authoritative set. Reconcile them and treat any URL in GSC not covered here as an
> **acceptance gate** item.

| Pattern | Example | New handling |
|---------|---------|--------------|
| Home | `/` | `src/pages/index.astro`. Keep section anchors `#about-me`, `#services`, `#contact`. |
| Blog index | `/news/` | `src/pages/news/index.astro` (page 1). |
| Blog pagination | `/news/page/2/` | Astro `paginate()` → `src/pages/news/[...page].astro` producing `/news/page/N/`. **Keep page 1 at `/news/` not `/news/page/1/`.** |
| Post (date-based) | `/2023/06/05/motivation/` | `src/pages/[year]/[month]/[day]/[slug].astro` via `getStaticPaths`. Zero-pad month/day. |
| Category | `/category/fitness/` | `src/pages/category/[...category].astro`. |
| Nested category | `/category/plans/eating/` | Same route — category slug is a **path** (`plans/eating`), not a single segment. Handle the hierarchy. |
| Author archive | `/author/grantbooysen/` | `src/pages/author/[author].astro` (single author for now). |
| Comment fragments | `/2023/06/05/motivation/#comments` | Fragment only — no redirect needed. Comments retired (below). |
| **NEW** Testimonials | `/testimonials/` | `src/pages/testimonials/index.astro`. |
| **NEW** Privacy | `/privacy-policy/` | `src/pages/privacy-policy/index.astro` (POPIA — see 05). |

### Known post URLs (seed the mapping; confirm full list from GSC)

```
/2023/06/05/motivation/
/2023/05/15/strawberry-protein-smoothie/
/2022/09/16/healthy-eating-plan/
/2021/09/15/weekly-workout-schedule/
/2021/09/15/calisthenics-workouts/
```

### Known categories (confirm full list from GSC)

```
/category/fitness/
/category/lifestyle/
/category/recipes/
/category/plans/eating/   (nested under "plans")
```

## Date-based routing (how)

Posts keep their original publish date in frontmatter (`pubDate`). The route is derived
from that date so the path is reproducible and stable:

```
/[year]/[month]/[day]/[slug]/
   2023 /  06   /  05 /motivation/
```

In `getStaticPaths`, map each post to `{ year, month: zeroPad(m), day: zeroPad(d), slug }`.
The `slug` is the original WP slug (store it explicitly in frontmatter as `slug:` to
guarantee an exact match — never let the CMS regenerate it from the title). **Any post
whose new slug ≠ old slug is an acceptance gate item** (must be a manual 301 instead).

## Redirects

Static redirects belong in Astro's `redirects` config (emits host-level redirect rules)
and/or Netlify's `_redirects` file. Use them for:

- apex → `www` (host/DNS level, 301).
- non-slash → slash safety net (the platform handles most; verify).
- Any legacy URL whose successor path differs (e.g. a renamed slug, a removed category).
  Each such redirect is **single-hop 301**, listed and reviewed at a gate. No redirect
  chains, no redirect loops.

```js
// astro.config.mjs (illustrative — only for genuine path changes)
redirects: {
  // '/old/path/': '/new/path/',
}
```

## Comments — retire

WordPress comments add a dynamic dependency, spam surface, and near-zero value (the
busiest post has 3 comments). Decision: **remove comments.** `#comments` is a fragment,
so no URL breaks. If Grant wants them later, add **Giscus** (GitHub-Discussions backed,
no DB) behind a flag — do not build it now.

## robots.txt & sitemap

- `robots.txt`: allow all content; `Disallow: /keystatic`; point to `sitemap-index.xml`.
- `@astrojs/sitemap` configured so emitted URLs carry trailing slashes and exclude the
  CMS admin and any `noindex` pages.
- RSS feed at `/rss.xml` for the blog (also referenced from `<head>`).

## Pre-launch URL parity check (gate)

Automated step in CI + manual sign-off: crawl the **old** site's URL set against the
**new** build; every old URL must return `200` (same path) or a single `301` to a live
`200`. Output a diff report. **Launch is blocked while any old URL would 404.**
