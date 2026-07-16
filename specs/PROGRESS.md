# PROGRESS — Grant Booysen PT rebuild

> Living status log. **Update this at the end of every Claude Code session.** A new
> session reads this + the repo to re-orient. Specs (`/specs`) = what to build;
> `CLAUDE.md` = how to behave; this file = where we are + what we decided.

**Last updated:** 2026-06-18 (session end)
**Current phase:** Phase 4 — on Netlify staging (`grantbthept.netlify.app`), **nearly launch-ready.**
This session cleared the biggest launch gates: **URL parity done without GSC** (pulled the old WP
`wp-sitemap.xml` — 13/14 URLs map 1:1, the one orphan Elementor page now 301s → home), **privacy
policy finalised** (basic, Grant signed off), **Google Analytics + POPIA cookie-consent banner**
built & verified, **newsletter confirmed deferred** (post-launch, non-blocking), and a **build-breaker
fixed** (the testimonial consent `.refine()` that crashed dev/Keystatic → now a render-time publish
filter). **Remaining before DNS flip:** (1) remove/replace the dummy testimonials (`sarah-m`,
`mike-g`); (2) commit + deploy. **At/after cutover:** DNS switch (domains.co.za → Netlify), then live
Lighthouse / Rich-Results / GA-Realtime / contact-form checks. **Deferred (non-blocking):** email
mailbox for `grant@grantbthept.co.za` (Netlify Forms still captures submissions in-dashboard without
it), Keystatic Cloud (so Grant self-edits live).
**Build state:** `astro check` 0/0/0; `npm run build` green (clean rebuild this session);
`npm run qa` 0 axe / 0 console-CSP (12 templates, incl. the new consent banner).
**Working tree:** clean except this PROGRESS update — **this session's work is committed** (HEAD
`3deb119`). It landed in two commits: `d7a4655` (consent-gate fix — `.refine()` removed from
`content.config.ts`, + specs/03) and `3deb119` (GA + cookie-consent banner — new
`components/layout/CookieConsent.astro`, `BaseLayout`, `Footer`, `privacy-policy/index.astro`,
and `astro.config.mjs` for the CSP script-src + the `/elementor-landing-page-719/` 301).
**Last build:** ✓ green. NOTE: on Windows a stale `.netlify/`+`dist/` cache makes the build fail with
`Cannot find module …prerender-entry….mjs`; `rm -rf .netlify dist` before `npm run build` clears it.

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
- **Keystatic — POPIA consent gate (publish filter, NOT a schema refine — fixed 2026-06-18).**
  Testimonial `consent` defaults to `false`; only `consent === true` entries publish. This is
  enforced as a **render-time filter** in the two testimonial pages, NOT a Zod `.refine()`. The
  old `.refine()` hard-failed content load, which crashed `astro dev`/`build` the instant Keystatic
  saved a half-authored testimonial (consent unticked) → catch-22: couldn't open Keystatic to tick
  the box. Unconsented entries now load but never render (no page/card/schema). Do NOT reinstate the
  refine. See specs/03.
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
- **`trailingSlash: 'ignore'` — NOT `'always'` (changed 2026-07-16 at a gate; see specs/02).**
  `'always'` 404'd Keystatic's Cloud OAuth callback, making live editing impossible. It turned out
  `'always'` was never what preserved the indexed URLs on Netlify: `build.format:'directory'` +
  Netlify's static directory handling issue the 301 (`/news` → `/news/`), and Astro's `'always'`
  **404s rather than 301s**, so it never produced that redirect for content — it only governed the
  on-demand routes (i.e. only Keystatic). Verified live under `'ignore'`: all 13 legacy URLs 200,
  `/news` still 301s to `/news/` (no duplicates), sitemap + canonicals keep their slashes.
  **Do not revert to `'always'`** — it breaks the CMS and changes nothing about indexed URLs.
  Caveat: the guarantee now rests on Netlify's directory handling → re-verify if the host changes.
- Added `/specs/09-references.md` (official docs for the stack).
- `CLAUDE.md` updated with the **Minimal-code mandate** and **Windows process discipline**
  rule (one astro process at a time → prevents EPERM file-lock errors).

## Open [VERIFY] items (need Grant before launch)
> Heads-up: LocalBusiness NAP is now mostly real. Email + **address confirmed**; **phone removed**
> (not published, per Grant); **geo omitted** until real coords are confirmed (no contradictory
> dummy coords ship). Still dummy/unconfirmed: geo coords + opening hours (`openingHours` not yet
> in schema). Replace those before production or Google indexes incomplete/wrong NAP.
- ~~Phone number~~ ✓ Removed 2026-06-08 — **not published** (Grant's decision); stripped from
  schema, site-settings, Keystatic + specs.
- ~~Physical training address~~ ✓ Confirmed 2026-06-08: **Planet Fitness Plattekloof, Bloulelie St,
  Plattekloof Rd, Plattekloof Park, Cape Town, 7500** (in `site-settings.json` → contact + JSON-LD).
- Geo coords — set 2026-06-08 to **-33.873037, 18.578080** (Planet Fitness Plattekloof, looked up
  + triangulated from two sources; now in LocalBusiness JSON-LD). _Soft-confirm:_ Grant should
  eyeball it against the Google Maps pin before launch, but it's the real gym location, not dummy.
- ~~Confirmed opening hours~~ ✓ Set 2026-06-08: **Mon–Fri 06:00–18:00** ("for now"). Stored as
  structured data in `site-settings.json` (single source) → drives both the contact-section display
  ("Monday – Friday: 6am – 6pm") and the new LocalBusiness `openingHoursSpecification` node.
- ~~Domain email vs the current gmail (E-E-A-T).~~ ✓ Confirmed 2026-06-08: **grant@grantbthept.co.za**
  (set in `site-settings.json` → contact section, privacy policy, LocalBusiness JSON-LD; gmail removed).
- Newsletter provider (Mailchimp / MailerLite / etc.).
- Documented consent + a real consented story to replace the `sarah-m` **SAMPLE** testimonial
  (its Review JSON-LD ships now; `AggregateRating` stays off until ≥1 real rating exists).

---

## Known bugs & fixes required (pick up next session)

> Run `npx astro check` at the start of a session to see the live list. As of 2026-06-08:
> **0 errors, 0 warnings, 0 hints** (fully clean). `npm run qa` = 0 axe / 0 console.

- ~~**[BUG] `Header.astro:81` — type error.**~~ ✓ Fixed 2026-06-08 (`setOpen(!!panel.hidden)`).
- ~~**[LINT] `content.config.ts` — `z` is deprecated.**~~ ✓ Fixed 2026-06-08 (import `z` from
  `astro/zod`). This was the source of all 27 hints — the "Tailwind canonical class" note below
  was stale; there were no Tailwind hints.
- **[SCHEMA, minor] dangling `isPartOf` `@id`.** `collectionGraph` sets `isPartOf:{@id:#website}`,
  but the `WebSite` node is only emitted on the home page → the ref is unresolved on archive pages.
  Harmless (CollectionPage/Blog aren't validated rich types; Google reconciles `@id` site-wide), but
  if it ever matters, either emit `websiteNode` site-wide or drop `isPartOf`.
- **[A11Y, deferred] `PostCard` renders a `<div>` (Card), not `<article>`.** Fine for a11y today;
  noted as a possible semantic upgrade (from the blog-templates session).
- **[BUILD, process — not a code bug]** stale `.netlify/`+`dist/` → `Cannot find module
  …prerender-entry….mjs`. Workaround: `rm -rf .netlify dist` before `npm run build`.

---

## Next up — testing → launch (Phase 4/5)

The site is on Netlify staging and nearly launch-ready. Most gates cleared this session
(URL parity, privacy, analytics, newsletter-deferral). What's left, in order:

1. **Dummy testimonials** — `sarah-m` + `mike-g` are placeholders; their Review schema ships
   live. Before launch: **remove them** (page falls back to "stories coming soon") or replace
   with a real **consented** story (add `AggregateRating` once ≥1 real rating). POPIA gate.
2. **Cutover (specs/08, Gate D):** add the domain in Netlify, set `www` primary; at domains.co.za
   point `www` CNAME → `grantbthept.netlify.app` and apex A → Netlify IP (website-only DNS, no MX
   to preserve — user confirmed no email hosting). TLS auto. The orphan `/elementor-landing-page-719/`
   301 is already in config; all other old URLs map 1:1 (verified vs wp-sitemap).
3. **Live validation (deploy-only):** Rich Results Test on the JSON-LD; Lighthouse (mobile) on a
   real URL (hero LCP only meaningful deployed); **accept the cookie banner → confirm GA4 Realtime
   fires with no console CSP error**; a real contact-form submission lands in Netlify → Forms.
4. **Deferred (non-blocking):** email mailbox for `grant@grantbthept.co.za` (Netlify Forms still
   captures submissions in-dashboard without a notification email — set one when email is sorted);
   newsletter (post-launch, needs provider); **Keystatic Cloud + invite Grant** (so he self-edits
   live — then add a CSP exception for `/keystatic`: `'unsafe-inline'` styles + `fonts.googleapis.com`).

Follow the Minimal-code mandate. No Alpine until an interactive component genuinely needs it.

### Single next step (start here next session)
**Handle the dummy testimonials** (item 1): remove `sarah-m` + `mike-g`, or wait for a real consented
story from Grant. That leaves the site genuinely launch-ready — all that remains is the **DNS cutover**
(item 2) and the **deploy-only validation** (item 3). **No dev work blocks launch.** Open user
decisions: email mailbox provider (explored, parked), and whether to launch with an empty
testimonials page or wait for Grant's real story.

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
- 2026-06-08 — **Disabled syntax highlighting (Shiki vs CSP).** `npm run dev` warned that Shiki
  colours code via inline styles incompatible with our CSP. No code content on this site, so set
  `markdown: { syntaxHighlight: false }` — warning gone, CSP stays strict, rare code renders as
  plain monospace (styled by Prose). Switch to `'prism'` (class-based, CSP-safe) only if code
  content is ever needed. Build green.
- 2026-06-08 — **Keystatic gated to dev-only (deployed /keystatic was broken).** On the first
  Netlify deploy, `/keystatic` showed unstyled + `api/keystatic/tree` 404s. Root cause: Keystatic
  is in **`local` storage mode**, which reads/writes the repo on disk — impossible on serverless;
  the admin can't function deployed (and CSP also blocks its CSS-in-JS + Google-Fonts UI). Fix:
  include the `keystatic()` integration **only when `isDev`** (`astro.config.mjs`), so production
  ships no admin route — no broken, publicly-exposed `/keystatic`. Editing stays local (dev +
  commit), unchanged. Verified: prod build emits no `/keystatic` page, no keystatic function, no
  redirects; `astro check` 0/0/0; build green. **Action for user:** commit + redeploy so the live
  `/keystatic` becomes a clean 404. **Future (live editing):** wire **Keystatic Cloud** (storage
  `cloud` + project + invite Grant) — at which point `/keystatic` needs a CSP exception (it needs
  `style-src 'unsafe-inline'` + `fonts.googleapis.com`; Astro's global CSP can't scope per-route,
  so likely exclude that route from the CSP meta or serve a relaxed policy for it).
- 2026-06-08 — **Contact form: branded inline success (kept Netlify Forms).** User chose to keep
  Netlify Forms but wanted an on-brand "message sent" confirmation instead of Netlify's default page.
  Added a vanilla AJAX submit in `ContactSection` (fetch → Netlify, still real Netlify Forms +
  honeypot): on success it hides the form and reveals an inline **success panel** (`role="status"`
  `aria-live="polite"`, focus moved to it — finally delivers the spec's aria-live success state); on
  failure an `role="alert"` **error panel** with a mailto fallback. Native `required`/email validation
  still runs first; **no-JS falls back** to a normal POST → Netlify's default page. CSP hashed the new
  inline script (verified, 0 console violations). `astro check` 0/0/0, build green, QA 0/0 (12 templates).
  **Also fixed the QA harness:** moved its static server off port 4321 → 4399 so it can't collide with a
  running `astro dev` (which had made it silently test the dev server). **Can't be tested locally** —
  Netlify Forms only records on the deployed site; after deploy, do a test submit + set a notification
  email (Netlify → Forms) to grant@grantbthept.co.za.
- 2026-06-08 — **About split: homepage teaser + new `/about/` page (user request — bio was a wall
  of text).** New **`about` singleton** (Keystatic: `summary`, `profileImage`/`profileAlt`, `intro`,
  `sections[]{heading,body}`) — bio migrated out of the homepage singleton (removed `aboutBody`/
  `profileImage`/`profileAlt` from homepage + its JSON), seeded into `about.json` restructured into
  sections (My journey → Certifications → Beyond the conventional → My philosophy). Homepage `About`
  is now a **compact teaser** (photo + summary + "Read my full story" → `/about/`, keeps `#about-me`
  anchor). New **`/about/`** route (`src/pages/about/index.astro`, additive — added to specs/02):
  intro + section headings + sticky portrait + reused Credentials strip + contact CTA, **Person
  schema** (E-E-A-T) + breadcrumb, one h1. Nav "About" now → `/about/`. QA route list + run extended
  to 12 templates: **0 a11y / 0 CSP**; `astro check` 0/0/0; build green. **Drafted content for review:**
  the homepage `summary` is my condensation of Grant's bio — Grant should refine it in Keystatic.
  **Note:** Keystatic config changed (new singleton) → dev server restart needed to edit "About page". Hero (background, done earlier
  this day) + now **profile photo** (About — asymmetric image/text layout when present, else centered),
  **service card images** (inset top of each card, decorative `alt=""`), and **credential logos**
  (logo when present, else the name wordmark; uses the existing `alt` field). All via the shared
  `lib/assets.resolveImage()` + conditional render, so each falls back to the prior text-only look
  until a photo is uploaded. **Gotcha found + fixed:** Keystatic **omits empty optional fields**
  from the singleton JSON on save (the hero upload dropped the `profileImage`/`profileAlt` keys),
  which broke the typed JSON import. Made every singleton-image consumer tolerant of absent keys
  (cast optional + defaults) so a CMS save can't break the type-check. Build green, `astro check` 0/0/0, `npm run qa` 0/0.
- 2026-06-08 — **Default OG/social image wired.** `BaseHead` now falls back to `siteSettings.ogImage`
  (resolved via `lib/assets`) when a page passes no `image` — so home/archives/testimonials/etc get a
  site-wide social image; posts keep using their hero. Emits an absolute `og:image` URL +
  `og:image:width`/`height` (from intrinsic metadata) and upgrades `twitter:card` to
  `summary_large_image`. Verified end-to-end by temporarily pointing `ogImage` at a real asset
  (absolute `/_astro/…` URL + 1600×800 dims emitted), then reverted to null. Upload a **1200×630**
  image via the Site settings singleton ("Default OG image") to activate it. **This was the last
  unwired singleton image — all image slots (hero, profile, services, credentials, OG) now render.** (a) Email → grant@grantbthept.co.za;
  **phone removed** (not published) from schema/settings/Keystatic + specs; address confirmed
  (Planet Fitness Plattekloof); geo looked up (-33.873037,18.578080); opening hours Mon–Fri 06:00–18:00
  stored structured (single source) → drives contact display + new `openingHoursSpecification`.
  LocalBusiness NAP now complete (only geo is a soft-confirm-vs-Maps). (b) **Hero background image:**
  added `heroImage` to the homepage singleton (Keystatic → `src/assets/home/`), extended `Section`
  with an optional full-bleed `bg` slot (relative isolate + `-z-10`), and wired `Hero.astro` to render
  it as the LCP element (full-bleed `<Image>` + `bg-dark/70` overlay, `loading=eager` +
  `fetchpriority=high`, decorative `alt=""`). New shared `lib/assets.ts` `resolveImage()` maps
  Keystatic singleton image path-strings → ImageMetadata via `import.meta.glob` (eager) — reusable
  for the still-unwired profile/service/credential/OG images (rule-of-three now met). Renders
  text-only until a photo is uploaded. **TODO refinement:** `<link rel=preload>` for the hero (LCP)
  not yet added — eager+fetchpriority only; add once a real asset exists + LCP is measured.
  Build green, `astro check` 0/0/0, `npm run qa` 0/0.
- 2026-06-08 — **Dev complete: lint cleanup, profile-image field, Phase 4 a11y QA (axe 0/CSP 0).**
  (a) **Lint → fully clean:** all 27 hints were the *same* `'z' is deprecated` warning in
  `content.config.ts` (the PROGRESS note about Tailwind canonical-class hints was stale).
  Fixed by importing `z` from `astro/zod` instead of the deprecated `astro:content` re-export.
  `astro check` is now **0 errors / 0 warnings / 0 hints**. (b) **Profile-image field** added to
  the homepage singleton (`keystatic.config.ts` `profileImage` + `profileAlt`; `homepage.json`
  keys null) — closes the noted content-model gap so Grant can upload via CMS. Render (asymmetric
  About layout) lands WITH the asset, same deferred pattern as the Services/Credentials singleton
  images — no single-use `import.meta.glob` machinery added (minimal-code mandate). (c) **Phase 4
  a11y QA harness** (`scripts/qa.mjs`, `npm run qa`): serves `dist/` statically + drives it with
  Playwright, runs **axe-core (WCAG 2.2 AA)** + captures console/CSP errors on one URL per template
  (11 routes). Justifies new devDeps `playwright` + `@axe-core/playwright` (specs/06+08 require axe
  in CI — this is that gate). First run found **9 violations**, all fixed:
  • Rating `<div>` had `aria-label` with no role (`aria-prohibited-attr`) → added `role="img"`.
  • Accent contrast: bright brand accent `#fd5a37` is only ~3.1:1 on white, so small `text-accent`
    eyebrow labels (light sections + 404) + the "Read story" link + white-on-`bg-accent` Before/After
    badges all failed AA. Added one AA-safe token `--color-accent-strong: #c2410c` (~5:1) and applied
    it surgically: light-bg eyebrows + Read-story → `text-accent-strong`; Before/After badge →
    `bg-accent-strong` (white now 5.2:1). **Dark-section accent (Contact eyebrow, Hero rotator) left
    bright** — it passes at 6.6:1 on `#030306` and darkening would BREAK it. This matches the design's
    own documented rule ("accent for fills/detail/hover, not small text"). **Design note for review
    (non-blocking):** small accent text/badges on light are now a deeper orange; bright accent
    unchanged for fills/buttons/hover/icons. Re-run: **0 axe violations, 0 console errors, 0 CSP
    violations across all 11 templates** → CSP is runtime-verified clean (the local 404s were the
    production-only Netlify Image CDN, excluded). Minor deferred: `hover:text-accent` on light bgs is
    ~3:1 on hover only (not axe-flagged, transient); revisit if a reviewer flags it.
- 2026-06-08 — **CSP + security headers + header scroll-condense (Phase 4 prep, dev-only).**
  (a) **CSP** via Astro 6's `security: { csp: true }` (NOT `experimental` — it graduated in
  Astro 6) in `astro.config.mjs` — emits a per-page `<meta http-equiv="content-security-policy">`
  with SHA-256 hashes for Astro's inline `type="module"` script + inline `<style>` blocks,
  `'self'` for the external stylesheet, `font-src 'self'` (self-hosted Poppins). No
  `default-src`/`img-src` → Netlify Image CDN + images stay unrestricted. Safe because the
  repo has zero inline `style=` attributes and the only inline `<script>` is JSON-LD (a data
  block, not script-src governed). (b) **Security headers** in a new `netlify.toml`
  (`Referrer-Policy`, `X-Content-Type-Options: nosniff`, `Permissions-Policy` locking
  camera/mic/geo, HSTS 2y preload). (c) **Header condenses on scroll** (specs/07 #1): vanilla
  scroll listener toggles `data-scrolled` on `<header>` past 4px; Tailwind `data-[scrolled]:`
  + `group-data-[scrolled]:` variants shrink padding (py-4→py-2) + add shadow, `transition-*`
  for smoothness (global reduced-motion rule already neutralises it — no per-element variant).
  Build green; verified CSP meta + compiled scroll CSS in `dist`. `astro check`: 0 errors.
  **NOT runtime-verified in a browser** — CSP console-violation check + the Lighthouse/axe pass
  are the next step (needs a preview + browser). 27 cosmetic lint hints still deferred.
- 2026-06-08 — **RSS feed + Header fix.** (a) Fixed the pre-existing `Header.astro:81` type
  error (`setOpen(!!panel.hidden)` — coerce the now-`string|boolean` `HTMLElement.hidden`);
  `astro check` is now **0 errors, 0 warnings, 27 hints** (clean baseline). (b) Built `/rss.xml`
  via `@astrojs/rss` (`src/pages/rss.xml.ts`) — published posts newest-first, absolute
  trailing-slash links via `lib/url.postUrl` + `id.split('/')[0]` (mirrors the post route),
  descriptions from `excerpt`. File-extension route so `trailingSlash:'always'` doesn't apply;
  verified NOT in the sitemap. Added the site-wide `<head>` `<link rel="alternate"
  type="application/rss+xml">` in `BaseHead`. New dep `@astrojs/rss` justified: spec (05/08)
  requires the feed; hand-rolled XML is worse. Build green; feed validated (5 items, valid
  RSS 2.0, correct legacy date URLs + pubDates).
- 2026-06-18 — **URL-parity check done (no GSC needed) + consent-gate redesign + orphan 301.**
  (a) **URL parity (specs/02, the core launch gate):** GSC access unavailable, so pulled the
  authoritative list from the **old WP site's own live `wp-sitemap.xml`** — only **14 indexed URLs**.
  Compared to the new build: **13/14 map 1:1 exactly** (home, `/news/`, all 5 date posts, all 6
  categories incl. `/category/plans/` parent + `plans/workout` — the latter was `[VERIFY]`, now
  CONFIRMED against the live sitemap). The **one** gap was `/elementor-landing-page-719/` (orphan
  Elementor auto-page, no real content) → added a single-hop **301 → `/`** in `astro.config.mjs`
  `redirects` (user-approved). Net: zero expected 404s at cutover. NOTE: the old WP author archive
  slug (`/author/...`) and any non-sitemap indexed URLs aren't covered by wp-sitemap — low risk
  (not in the published index), spot-check in GSC post-launch. (b) **Consent gate redesigned
  (build-breaker fix):** a dummy `mike-g` testimonial saved via Keystatic (consent unticked) crashed
  `astro dev`/`build` via the schema `.refine(consent===true)` → blank `/keystatic`, couldn't author.
  Removed the refine; consent is now a **render-time publish filter** (already present in both
  testimonial pages), so unconsented entries load but never render. Updated specs/03 + the fix note
  above. `astro check` 0/0/0 with the dummy present.
- 2026-06-18 (cont.) — **Google Analytics + POPIA consent banner + privacy policy finalised; newsletter
  confirmed deferred.** (a) **Privacy policy** is now **basic + signed off** (Grant accepts basic) —
  dropped the draft/pending framing, resolved all `[VERIFY]` placeholders (retention, contact, sharing)
  to plain wording, removed every newsletter mention. (b) **Newsletter** explicitly deferred to
  post-launch (user) — no code, blocks nothing. (c) **Analytics = Google Analytics (G-6WB7VFEB4Q)**
  behind a **cookie-consent banner** (user chose opt-in over no-banner/cookieless). New
  `components/layout/CookieConsent.astro` (in `BaseLayout`, site-wide): GA's gtag.js loads ONLY after
  Accept; choice stored in localStorage; Decline never loads GA; **withdrawable** via a new Footer
  "Cookie settings" button (`[data-cookie-settings]`) that re-opens the banner. The consent script is
  bundled (Astro-hashed), so no inline-hash needed. (d) **CSP:** switched `security.csp` from `true`
  to `{ scriptDirective: { resources: ["'self'", googletagmanager.com] } }` — GA's tag script was the
  ONLY thing the strict CSP blocked (its data calls to google-analytics.com use connect/img, which are
  unrestricted since no `default-src` is set). Verified in a clean build: emitted `script-src` =
  `'self' googletagmanager.com` + auto SHA-256 hashes; `_redirects` carries the elementor 301; **`npm
  run qa` = 0 a11y / 0 console-CSP across all 12 templates**; `astro check` 0/0/0. **Final GA check is
  deploy-only:** on the live site, accept the banner and confirm GA fires in GA4 Realtime with no
  console CSP error. (e) Still launch-gated: a real consented testimonial (mike-g/sarah-m are dummies),
  live Rich-Results/Lighthouse pass, contact-form test + notification email, DNS cutover, then Keystatic Cloud.
- 2026-07-16 — **Keystatic Cloud wired + the `trailingSlash` deviation (gated, approved).**
  (a) **Keystatic Cloud live:** project `grantbthept/website` (team `grantbthept`, repo
  Slasher27/grantbthept). `keystatic.config.ts` → `storage:{kind:'cloud'}` + `cloud:{project}`;
  removed the dev-only `isDev` gate in `astro.config.mjs` so `/keystatic` ships to production.
  Cloud Project URLs allowlist: `https://www.grantbthept.co.za` (primary) +
  `https://grantbthept.netlify.app`; localhost is NOT accepted in that list — local dev is covered
  by the **"Allow local development"** checkbox (authenticates from `http://127.0.0.1`, so use
  `127.0.0.1:4321`, NOT `localhost:4321`). (b) **The CSP exception this file predicted was NOT
  needed** — Astro injects its CSP meta into `<head>`, and Keystatic's admin page renders no
  `<head>` (client-only React shell), so no policy applies to it. (c) **`trailingSlash` 'always'
  → 'ignore'** — see the decision entry above + specs/02. `'always'` 404'd the Cloud OAuth callback
  (`/keystatic/cloud/oauth/callback`), making login impossible. **Netlify-level fixes do NOT work
  and were reverted (commit 263f307):** Netlify's redirect matcher ignores trailing slashes, so a
  `/keystatic → /keystatic/` 301 also matched `/keystatic/` → infinite redirect loop; and Netlify
  cannot rewrite *into* an SSR-function path, so the 200 rewrites never fired. (d) **Verified live
  after the fix:** OAuth callback 200 (was 404), `/keystatic/` + `/keystatic` both 200, **all 13
  legacy URLs 200**, elementor 301, `/news` → 301 → `/news/` (no duplicates), sitemap + canonicals
  keep slashes, `astro check` 0/0/0, build green. **Still to do:** a human end-to-end login (open a
  collection, save an entry → confirm it commits to GitHub + triggers a Netlify rebuild), then
  invite Grant (Users tab → email; free plan ≤3 users).
