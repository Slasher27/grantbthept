# PROGRESS — Grant Booysen PT rebuild

> Living status log. **Update this at the end of every Claude Code session.** A new
> session reads this + the repo to re-orient. Specs (`/specs`) = what to build;
> `CLAUDE.md` = how to behave; this file = where we are + what we decided.

**Last updated:** 2026-06-05
**Current phase:** Phase 3 (pages + design) — templates + structured data complete; RSS and
the contact/newsletter backend are the remaining Phase 3 items.
**Last build:** ✓ green (`npm run build`) — clean rebuild. NOTE: on Windows a stale
`.netlify/`+`dist/` cache makes the build fail with `Cannot find module …prerender-entry….mjs`;
`rm -rf .netlify dist` before `npm run build` clears it. (See decisions below.)

---

## Done

### Phase 1 — Foundation ✓
- Astro 6.4 project scaffolded (minimal, no boilerplate).
- `astro.config.mjs`: `trailingSlash:'always'`, `build.format:'directory'`, Netlify adapter.
- Tailwind v4 via `@tailwindcss/vite`; `@theme` tokens in `src/styles/global.css`.
- Integrations wired: MDX, sitemap (excludes `/keystatic`), React (Keystatic peer), Keystatic.
- Content collections + Zod schemas (`src/content.config.ts`): `posts`, `testimonials`.
- Folder structure + all route stubs created. Build prerendered every URL at the correct
  trailing-slash path, incl. `/2023/06/05/motivation/` and nested `/category/plans/eating/`.

### Phase 2 — Content & migration ✓
- Posts migrated from live WordPress to MDX with exact original slug + pubDate (URLs preserved).
- Categories mapped (fitness, lifestyle, recipes, plans/eating).
- Images pulled into `src/assets/`, served via Astro Image.
- Singletons populated (homepage, services, credentials, siteSettings) — business facts flagged `[VERIFY]`.
- Keystatic editing confirmed working end-to-end in dev.
- Phase 2 build green; post URLs match the live site.

---

## Fixes applied
- **Keystatic — admin API trailing slash (commit 362a578).** The admin UI calls its local API
  *without* a trailing slash, which `trailingSlash:'always'` rejected → "Unable to load
  collection". Fix: relax to `trailingSlash:'ignore'` in **dev only** (`isDev` guard in
  `astro.config.mjs`); the production build keeps `'always'` so indexed URLs stay spec-compliant.
- **Keystatic — slug = entry folder name (commit f3ed6f0).** Posts use `slugField:'title'` +
  `path:'src/content/posts/*/'` so the entry's folder *is* the slug; that + `pubDate` reproduce the
  exact legacy date URL (specs/02). Same pattern for testimonials (`slugField:'clientName'`).
- **Keystatic — co-located images (commits 2d7dbc3, af41871).** `heroImage`/before/after use no
  `directory`/`publicPath`, so Keystatic writes the upload beside the entry (`./hero.<ext>`) and
  Astro's `image()` resolves the relative path. Each post/testimonial is self-contained.
- **Keystatic — POPIA consent gate.** Testimonial `consent` checkbox defaults to `false`; the Zod
  schema `.refine()` blocks the build if a testimonial publishes without consent.
- **Storage = local (git-based).** Commits MDX/JSON straight to the repo. Keystatic **Cloud** is
  the chosen launch path (invite Grant by email) but not wired yet — see decisions below.
- **Windows build-cache crash (this session).** A fresh `npm run build` failed with
  `Cannot find module …\.prerender\prerender-entry.<hash>.mjs` from a stale `.netlify/`+`dist/`.
  `rm -rf .netlify dist` before building fixes it. Pair with the one-astro-process rule (EPERM).

## Key decisions & deviations from spec
- **Host: Netlify** (not Cloudflare). `@astrojs/netlify` adapter → build reports
  `mode:"server"` but all public pages are prerendered static; only Keystatic routes run
  as functions. Expected, correct.
- **CMS auth: [DECIDE — not yet wired].** Recommended: **Keystatic Cloud** (invite Grant by
  email, no GitHub account needed, free ≤3 users) over GitHub mode. Confirm before launch.
- `trailingSlash:'always'` confirmed (deliberate override of the house `never` convention).
- Added `/specs/09-references.md` (official docs for the stack).
- `CLAUDE.md` updated with the **Minimal-code mandate** and **Windows process discipline**
  rule (one astro process at a time → prevents EPERM file-lock errors).

## Open [VERIFY] items (need Grant before launch)
> Heads-up: the `site-settings.json` **dummy** phone/address/geo + the current gmail now ship
> **live in the LocalBusiness JSON-LD** (user OK'd dummy data for now). These MUST be replaced with
> real values before production, or Google indexes fake NAP. `openingHours` is not yet in schema.
- Phone number + physical training address + geo coords (LocalBusiness schema — currently dummy).
- Confirmed opening hours (needed as a structured value to add `openingHoursSpecification`).
- Domain email vs the current gmail (E-E-A-T) — gmail currently in schema + on the contact section.
- Newsletter provider (Mailchimp / MailerLite / etc.).
- Documented consent + a real consented story to replace the `sarah-m` **SAMPLE** testimonial
  (its Review JSON-LD ships now; `AggregateRating` stays off until ≥1 real rating exists).

---

## Known bugs & fixes required (pick up next session)

> Run `npx astro check` at the start of a session to see the live list. As of 2026-06-05:
> **1 error, 0 warnings, 27 hints.** None are from the JSON-LD pass.

- **[BUG] `Header.astro:81` — type error (blocks a clean `astro check`).** `setOpen(panel.hidden)`:
  the DOM lib now types `HTMLElement.hidden` as `string | boolean` (it reflects `hidden="until-found"`),
  but `setOpen(open: boolean)` wants a boolean. Runtime behaviour is correct; it's type-only.
  Fix: coerce — `setOpen(!!panel.hidden)`. Pre-existing (mobile-nav toggle), not from this session.
- **[LINT] `content.config.ts` — `z` is deprecated (ts 6385).** `z` re-exported from `astro:content`
  is deprecated. Low priority; migrate to the recommended import when convenient.
- **[LINT] 27 Tailwind "canonical class" hints** across templates (`aspect-[16/10]`→`aspect-16/10`,
  `rounded-[var(--radius)]`→`rounded-(--radius)`). Cosmetic; optional normalization pass.
- **[SCHEMA, minor] dangling `isPartOf` `@id`.** `collectionGraph` sets `isPartOf:{@id:#website}`,
  but the `WebSite` node is only emitted on the home page → the ref is unresolved on archive pages.
  Harmless (CollectionPage/Blog aren't validated rich types; Google reconciles `@id` site-wide), but
  if it ever matters, either emit `websiteNode` site-wide or drop `isPartOf`.
- **[A11Y, deferred] `PostCard` renders a `<div>` (Card), not `<article>`.** Fine for a11y today;
  noted as a possible semantic upgrade (from the blog-templates session).
- **[BUILD, process — not a code bug]** stale `.netlify/`+`dist/` → `Cannot find module
  …prerender-entry….mjs`. Workaround: `rm -rf .netlify dist` before `npm run build`.

---

## Next up — Phase 3 (pages + design)
Per `/specs/07-page-specs.md`, with `04` (design system), `05` (SEO/schema), `06` (perf/a11y).
1. ~~Sample the real brand colours + font from the live site → replace placeholder tokens.~~
   ✓ **Done** — sampled from the live Blocksy palette + self-hosted Poppins (see session log).
2. Build the layouts + UI primitives, then home sections, blog index/pagination, post
   template, category (incl. nested), author, `/testimonials/`, `/privacy-policy/`, `404`.
3. ~~Structured data per page type.~~ ✓ **Done** — `lib/schema.ts` + `Schema.astro`, wired to
   every template (see session log). LocalBusiness NAP now ships dummy (user OK'd); real values +
   testimonials swap at production. Left to do: validate live in Rich Results Test after deploy.
4. **`/rss.xml` + `<head>` `<link rel="alternate">`** (specs/05, 08) — last quick, unblocked
   launch item. Adds `@astrojs/rss` (justified: spec requires the feed; hand-rolled XML is worse).
5. Contact/newsletter backend — deferred by user (Resend after launch; newsletter needs a
   provider). Stays on the Netlify-Forms demo path.
6. Hit the `06` budgets (Lighthouse, CWV, axe) on each template — Phase 4.

Follow the Minimal-code mandate. No Alpine until an interactive component genuinely needs it.

### Single next step
Build **`/rss.xml`** (+ the head `<link>`) — see item 4. Everything after that is either
deferred (backend) or a whole phase (Phase 4 QA/budgets).

---

## Session log
- 2026-06-0X — Phase 1 scaffolded, build green.
- 2026-06-0X — Phase 2 content migrated; Keystatic issues resolved; build green.
- 2026-06-05 — Phase 3 start: sampled live brand identity (Blocksy `--theme-palette-color-N`)
  and replaced the placeholder `@theme` colour tokens with the real palette — accent
  `#fd5a37`, ink `#030306`, muted `#70707e`, line `#dfdfe2`, paper `#fbfbfb`. Brand font is
  **Poppins** (live `--theme-font-family`); self-hosted via the Astro 6 `fonts` API (Google
  provider, downloaded at build → served from `/_astro/fonts/`, no runtime CDN), weights
  400/600/700, `<Font preload>` in `BaseLayout`. Build green; 3 woff2 emitted. A11y note:
  accent is 3:1 on white (fills/detail/hover only, not small body text) — matches the brand's
  own near-black-button → accent-hover pattern, so no shade change needed.
- 2026-06-05 — Phase 3 layouts + first UI primitives. Added `BaseHead` (title, self-canonical
  with trailing slash, OG/Twitter, `lang="en-ZA"` — specs/05), sticky `Header` (wordmark,
  desktop nav + Contact CTA, accessible mobile disclosure), dark `Footer` (nav, social from
  siteSettings, auto-year), and primitives `Container` + `Button` (solid/outline). `BaseLayout`
  now renders the full shell: skip link → Header → `<main id="main">` → Footer; the 8 stub
  pages dropped their own `<main>`. Base CSS layer added (body/heading/focus-visible/skip-link/
  reduced-motion). Build green; canonicals verified on flat + nested + index routes.
  Decisions: (a) **no Alpine** — mobile nav is ~15 lines of vanilla (disclosure pattern,
  Esc-closes + focus return) per the minimal-code mandate, keeping the post template
  near-zero-JS; (b) Button is ink/white solid → accent-on-hover (brand pattern; accent-on-white
  is only 3:1, so it's reserved for hover/detail, not body-size text). Still TODO: real
  logo asset (using a Poppins wordmark for now); `Section`/`Card`/`Badge`/`Prose` land with the
  home/blog pages that consume them.
- 2026-06-05 — Phase 3 Home page built. Sections: `Hero` (dark, CSS-only rotating service
  words — zero JS, reduced-motion safe), `About` (#about-me, bio from singleton), `Services`
  (#services, 3 cards), `BlogPreview` (3 latest posts), `Credentials` (wordmark strip),
  `ContactSection` (#contact — details + email CTA). New primitives: `Section` (tone
  light/paper/dark), `Card`, `Badge`, `blog/PostCard`, plus `lib/dates.ts`. `Button` gained an
  `accent` variant (accent fill + ink text = 5.97:1 AA, works on dark) and a currentColor
  `outline` (inherits section tone). Build green; home has one H1, all anchors (#about-me/
  #services/#contact), clean h1→h2→h3 order. Post images optimise via the Netlify Image CDN
  (responsive srcset + lazy + fixed dims, no CLS) — adapter default, not static `_astro` files.
  Deferred (need assets/decisions, not blocking): contact + newsletter **forms** (Resend
  endpoint + Altcha + POPIA — own task); **JSON-LD schema** (Person/LocalBusiness/Service —
  own pass, specs/05); **image assets** (hero LCP, profile photo, service + credential logos)
  not yet gathered, so those slots are text-first for now; homepage singleton has **no profile-
  image field** (content-model gap to add with the photo). Phone + street address stay [VERIFY]
  placeholders so the contact section shows only confirmed details (email, hours, Cape Town).
- 2026-06-05 — Phase 3 blog templates complete. `PostLayout` (breadcrumb, meta row with
  author link + date, category badges, answer-first lead, Prose MDX body, optional FAQ `<dl>`,
  "not medical advice" line for nutrition posts, share links, author bio card, 3 related posts,
  contact CTA) — **zero page JS** (only the shared nav toggle). Shared `ArchiveLayout` powers
  `/news/`, pagination (`/news/page/N/`), category (flat + nested breadcrumb), and author
  archives (DRY). New: `ui/Prose` + `.prose` styles in global.css, `blog/Breadcrumb`,
  `blog/Pager` (rel prev/next, page 1 = base path), `lib/related.ts`, `lib/author.ts`. Build
  green; verified one H1/page, clean heading order, all 5 posts list, nested breadcrumb
  (plans/eating), trailing-slash URLs preserved. Note: PostCard renders a `<div>` (Card), not
  `<article>` — fine for a11y, could upgrade later. Still pending in Phase 3: `/testimonials/`,
  `/privacy-policy/`, `/404` (still stubs); **JSON-LD schema** pass (BlogPosting/FAQPage/
  BreadcrumbList/Person/LocalBusiness/Service); **RSS** `/rss.xml` + head `<link>`; contact +
  newsletter **forms**.
- 2026-06-05 — Phase 3 UI complete for a demo deploy. Built `/404` (on-brand, helpful links),
  `/testimonials/` (`TransformationCard` — consented only, featured-first; before/after pair
  renders only when both images exist; seed entry shows as a clean text card), `/privacy-policy/`
  (full POPIA **draft** with `[VERIFY]` flags — needs Grant's sign-off before launch), and a real
  **contact form** in `ContactSection`. **DEMO DEVIATION:** the form posts to **Netlify Forms**
  (`data-netlify` + honeypot + required POPIA consent) so it works on the demo with zero backend;
  the spec launch path (Astro endpoint → Resend + Altcha) replaces it later. Build green; every
  template now real. **Demo-ready** — site builds + deploys on the Netlify adapter.
  Not yet done (launch-gating, NOT demo-blocking): JSON-LD schema pass; `/rss.xml` + `robots.txt`;
  Resend+Altcha contact backend; newsletter (needs provider); image assets + `[VERIFY]` facts
  (phone/address/geo); privacy-policy sign-off. Note: canonicals point at the production domain
  (www.grantbthept.co.za), which keeps the *.netlify.app demo from being indexed as duplicate.
- 2026-06-05 — Added individual testimonial story pages (user decision). New route
  `/testimonials/<slug>/` (`testimonials/[slug].astro`, consented only) renders the full MDX
  story + before/after + meta; cards now link to it ("Read story →"). Recorded the new route in
  specs/02. Extracted shared `testimonials/Rating` + `testimonials/BeforeAfter` components and
  `lib/testimonials.ts` (PROGRAM_LABELS + slug/url) so card + detail stay DRY. Rewrote the
  sarah-m seed body as a realistic **SAMPLE** story (clearly placeholder — replace with a real
  consented story before launch, POPIA). Build green; detail page has one H1 + breadcrumb,
  card→detail link verified.
- 2026-06-05 — Image prep for real assets. (a) `BeforeAfter` now crops **portrait 4:5**
  (full-body transformation shots) instead of square. (b) Added the **large in-article hero**
  to `PostLayout` (16:10, `loading=eager` + `fetchpriority=high` → LCP element, specs/06).
  (c) Bumped responsive `widths` for retina: PostCard [384,640,960], before/after card
  [256,384,512] + detail [360,540,720]. Build green. **Asset specs to source:** article hero
  landscape 16:10 ~1600×1000; testimonial before/after matched portrait 4:5 1080×1350.
  (d) Keystatic Cloud — PENDING user: repo is on GitHub (Slasher27/grantbthept); user to create
  the keystatic.cloud project, then switch config `storage:{kind:'cloud'}` + `cloud:{project}`
  and invite Grant by email so uploads work from the deployed `/keystatic`.
- 2026-06-05 — **JSON-LD structured-data pass** (specs/05). One source of truth in
  `lib/schema.ts` (typed node builders) emitted through a single `components/layout/Schema.astro`
  (`<script type="application/ld+json">`); `BaseLayout` gained a `schema?` prop. Entities are
  described once and referenced by `@id` (`#website`/`#person`/`#business`) so they never drift.
  Wired per page type: **Home** → WebSite + Person + LocalBusiness/HealthAndBeautyBusiness +
  3× Service. **Post** → BlogPosting (author/publisher → Person, ISO dates, absolute hero image,
  canonical mainEntityOfPage) + FAQPage when `faq` present. **/news/** → Blog; **category/author/
  testimonials index** → CollectionPage. **Testimonial detail** → Review (itemReviewed → business,
  reviewRating). **Breadcrumb component now emits its own BreadcrumbList** from the same items it
  renders — one per deep page, can't drift from the visible trail; home/404 carry none. Posts also
  now set `og:image`/Twitter image (heroImage.src) — free win while wiring. Build green; extracted
  + JSON-parsed every page type to verify valid JSON, correct @id resolution, trailing-slash URLs.
  `astro check`: 0 new errors (the 1 error is pre-existing in Header.astro mobile-nav toggle).
  **Acceptance-gate calls (user 2026-06-05):** (a) LocalBusiness `telephone`/`address`/`geo` now
  wired from the **DUMMY** `site-settings.json` placeholders (user: "use dummy data for now") so the
  node is complete + Rich-Results-testable; Grant confirms real NAP before production. `openingHours`
  still OUT — free-text `hours` needs a structured value at production. (b) `AggregateRating` not
  emitted — only one testimonial and it's SAMPLE data (sarah-m); fabricating review stars risks a
  Google penalty. The Review node DOES emit for sarah-m (mirrors the visible, consented-flagged
  page) — replace with a real consented story before launch, then add AggregateRating once ≥1 real
  rating exists. Still pending in Phase 3: `/rss.xml` + head `<link>`; Resend+Altcha contact backend;
  newsletter (needs provider); image assets + `[VERIFY]` facts.
- _(add new entries here each session)_
