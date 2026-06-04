# 07 — Page Specs

Shared: `BaseLayout` (head, header, footer, skip link), `Section`/`Container` primitives,
breadcrumb on all blog pages. Every page meets the `06` gates and `05` schema rules.

## `/` — Home (single page, anchored sections)

Order and anchors must be preserved (`#about-me`, `#services`, `#contact`).

1. **Header / nav** — logo (black/white variants for light/dark sections), links: Home,
   About (`#about-me`), Services (`#services`), Latest News (`/news/`), Testimonials
   (`/testimonials/`), "Contact Me" CTA (`#contact`). Mobile: accessible disclosure menu
   (Alpine), focus-trapped. Sticky, condenses on scroll.
2. **Hero** (dark) — H1 "Personal Training & Lifestyle Coaching"; rotating/animated
   service words (NUTRITION · 1-ON-1 TRAINING · FAT LOSS · LIFESTYLE COACHING · CORPORATE
   WELLNESS); two CTAs (Services, Contact). One orchestrated load reveal. LCP image
   optimised + preloaded.
3. **About** (`#about-me`) — Grant's bio (from `homepage` singleton), profile image,
   REPSSA badge. Emits `Person` schema. Asymmetric image/text layout.
4. **Services** (`#services`) — three cards from the `services` singleton: Personal
   Training, Lifestyle Coaching, Corporate Wellness (title, bullets, image, CTA → contact).
   `Service` schema.
5. **Blog preview** — three most-recent posts (cards: image, categories, title, excerpt,
   date), "Latest Articles" → `/news/`.
6. **Credentials** — partner/cert logo strip from `credentials` singleton (Precision
   Nutrition, Kettlebells for Africa, Advanced Coaching Academy, REPSSA, Virgin Active),
   each with alt + link.
7. **Contact** (`#contact`) — form (Name, Email, Subject, Message) + details (location,
   hours, email) + **POPIA consent checkbox**. Altcha + honeypot. Success/error states
   announced via `aria-live`. See `01` for the endpoint.
8. **Newsletter** — single email field + consent, double opt-in.
9. **Footer** (dark) — nav, logo, tagline, copyright (auto year), privacy-policy link,
   social.

## `/news/` — Blog index + `/news/page/N/`

- Page 1 at `/news/`, subsequent at `/news/page/2/` … via `paginate()`.
- H1 "Latest News", breadcrumb (Home › Latest News), post grid (`PostCard`), prev/next
  pager that emits the correct slash URLs, optional category filter chips.
- `rel="next"/"prev"` hints; `Blog` + `BreadcrumbList` schema. RSS `<link>` in head.

## `/[year]/[month]/[day]/[slug]/` — Post (`PostLayout`)

- Breadcrumb (Home › Latest News › Title). H1 = title. Meta row: author (Grant, links to
  `/author/grantbooysen/`), date, updated date, category badges.
- **Answer-first lead** (the `answer` field) as opening paragraph. `Prose`-wrapped MDX body.
- Optional FAQ block (→ `FAQPage` schema). Author bio card (E-E-A-T). Related posts (3,
  same category) + relevant service CTA. Share links. `BlogPosting` + `BreadcrumbList`
  schema. **0 KB JS target.**
- Health/nutrition posts include the brief "not medical advice" line.

## `/category/[...category]/` — Category archive

- Handles single (`fitness`) and **nested** (`plans/eating`) paths. H1 = category name,
  breadcrumb reflecting hierarchy, filtered post grid, pagination if needed.
- `CollectionPage` + `BreadcrumbList`. Self-canonical.

## `/author/grantbooysen/` — Author archive

- Grant bio + credentials + `Person` schema, list of his posts. (Single author today;
  keep the route generic for future-proofing without over-engineering.)

## `/testimonials/` — NEW (before/after)

- H1 "Client Transformations". Intro line. Grid of `TransformationCard`s from the
  `testimonials` collection (only `consent: true`), `featured` first, then `order`.
- Each card: before/after images (equal aspect, labelled, accessible `BeforeAfter`
  component — a simple labelled pair or an accessible slider with keyboard support and
  reduced-motion fallback), headline, summary, program, duration, optional rating.
- CTA to contact. `Review` per testimonial + `AggregateRating` on the business (real
  ratings only). Respect the privacy rules in `03`.

## `/privacy-policy/` — NEW (POPIA)

- Plain-language policy: data collected (contact/newsletter), purpose, retention, third
  parties (email/analytics provider), data-subject rights, contact. `[VERIFY]` with Grant.

## `/404`

- On-brand 404 with search/links back to Home, News, Services. Helpful, not a dead end.
