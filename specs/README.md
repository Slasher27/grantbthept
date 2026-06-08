# Grant Booysen PT — Website Rebuild Spec

Rebuild of **grantbthept.co.za** (WordPress/Elementor → Astro) for Grant Booysen, a
Cape Town personal trainer & lifestyle coach. This folder is the source of truth for
Claude Code. Read `CLAUDE.md` first, then work through the numbered docs in order.

## Read order

| File | Purpose |
|------|---------|
| `CLAUDE.md` | How Claude Code must operate on this repo (rules, gates, conventions). |
| `01-tech-stack.md` | Stack, package list, config, CMS, hosting. |
| `02-architecture-and-urls.md` | Sitemap, **URL preservation (critical)**, routes, redirects. |
| `03-content-model.md` | Content collections, Zod schemas, CMS authoring. |
| `04-design-system.md` | Colour tokens, typography, spacing, components, motion. |
| `05-seo-aeo-schema.md` | Metadata, structured data, AI-Overview / answer-engine optimisation. |
| `06-performance-a11y.md` | Core Web Vitals targets, image/font strategy, WCAG 2.2 AA. |
| `07-page-specs.md` | Page-by-page build specs. |
| `08-build-plan.md` | Phased milestones, acceptance gates, launch/migration checklist. |

## Non-negotiables (the whole point of the rebuild)

1. **Preserve the live index.** Every currently-indexed URL must resolve `200` at the
   exact same path (trailing slash included) or `301` to its successor. No URL may
   silently 404 or duplicate. See `02-architecture-and-urls.md`.
2. **`trailingSlash: 'always'`.** The existing site uses trailing slashes everywhere.
   This overrides the usual `never` house convention — matching the index is what
   matters here.
3. **Lean code, DRY, no bloat.** One way to do each thing. Shared layouts, one design
   token source, no copy-paste components, no unused dependencies.
4. **Best-practice Core Web Vitals, a11y, SEO, AEO** — measurable gates in
   `06-performance-a11y.md` and `08-build-plan.md`, not aspirations.

## What the site is

- **Single-page marketing home** (`/`) with anchored sections: hero, about, services
  (Personal Training / Lifestyle Coaching / Corporate Wellness), blog preview,
  credentials, contact, newsletter.
- **Blog** ("Latest News") at `/news/` with date-based posts, categories, author archive,
  pagination, and WordPress comments (to be retired — see `02`).
- **NEW: `/testimonials/`** — before/after client transformation stories.
- **NEW supporting pages:** `/privacy-policy/`, `/contact/` (standalone, optional).

## Business facts (use these; verify with Grant before launch — flagged `[VERIFY]`)

- Name: Grant Booysen. REPSSA member. Cape Town, South Africa.
- Services: 1-on-1 personal training, lifestyle/nutrition coaching, corporate wellness.
- Credentials: Loots Academy (Gym Mgmt/Instructor), Precision Nutrition, Kettlebells for
  Africa, ETA Sports Massage, Spinning (Loots), Advanced Coaching Academy (Phil Learney).
- Hours: Mon–Fri 7am–7pm, Weekend 10am–5pm. `[VERIFY]`
- Email: grant@grantbthept.co.za ✓ confirmed.
- Training location: Planet Fitness Plattekloof — Bloulelie St, Plattekloof Rd, Plattekloof
  Park, Cape Town, 7500. ✓ confirmed. Geo coords still `[VERIFY]`.
- Phone: not published (business decision).

> Convention: anything not confirmed by Grant carries a `[VERIFY]` flag in content and
> must be resolved at a human acceptance gate before launch. Never invent facts.
