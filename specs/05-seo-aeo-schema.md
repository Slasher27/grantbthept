# 05 — SEO, AEO & Structured Data

Goal: hold the existing organic position through the migration, then win **AI Overview /
answer-engine citations** on top. The 2026 consensus: traditional SEO foundations stay
mandatory (crawlable, fast, well-linked, authoritative), and on top of them you add
**answer-first content, clean entities, and schema that mirrors visible content.**

## Foundations (every page)

- Single `<BaseHead>` component owns `<title>`, meta description, canonical (self,
  absolute, with trailing slash), Open Graph, Twitter card, `lang="en-ZA"`.
- Unique title (≤ 60 chars) + description (≤ 155) per page, sourced from content
  frontmatter — never duplicated, never auto-generated boilerplate.
- Canonical = the trailing-slash `www` URL. Exactly one canonical per page.
- `sitemap-index.xml` (via `@astrojs/sitemap`), `robots.txt`, `/rss.xml`.
- Internal linking: posts link to related posts + relevant service; services link to
  supporting posts; testimonials link to the matching service. Build a small "related"
  helper in `lib/` (DRY) rather than hand-linking.
- Clean heading hierarchy, descriptive link text (no "click here"), breadcrumb on blog.

## AEO / AI-Overview layer

1. **Answer-first.** Each post leads with a direct 40–60 word answer to the query the post
   targets (the `answer` field, `03`). Render it as the opening paragraph *and* feed it to
   FAQ/Article schema. Sections start with the conclusion, then support it.
2. **Extractable structure.** Short paragraphs, descriptive `<h2>/<h3>` phrased as the
   questions people ask, occasional definition lists and comparison tables. Machines should
   parse meaning without guessing.
3. **Entity clarity.** Be unambiguous about *who* (Grant Booysen, REPSSA-registered PT,
   Cape Town) and *what* (named methods/certs). Consistent naming across the site +
   `sameAs` links (social, REPSSA profile, Advanced Coaching Academy) in schema.
4. **E-E-A-T.** Author bio + credentials on every post (real person, real quals),
   `dateModified` surfaced, sources cited where claims are factual (nutrition/health).
   Health content carries a brief "not medical advice — consult a professional" line
   (also reduces YMYL risk).
5. **Freshness.** `updatedDate` shown and emitted in schema; plan quarterly refreshes of
   evergreen posts.
6. **FAQ blocks** on posts and key pages where natural — strong AI-Overview surface.

## Structured data (JSON-LD) — build once in `lib/schema.ts`

Reflect only what's visible on the page. Validate every type in Google's Rich Results
Test. Emit via a single `<Schema>` component fed typed data — no hand-written JSON-LD in
templates (DRY, avoids drift).

| Page | Schema |
|------|--------|
| Site-wide | `WebSite` (+ `SearchAction` if site search ships) and a single org/person node. |
| Home / about | **`Person`** (Grant — name, jobTitle, knowsAbout, alumniOf/credentials, `sameAs`) **+ `LocalBusiness`/`HealthAndBeautyBusiness`** (name, areaServed: Cape Town, geo, hours, email) `[VERIFY geo]`. (Phone is not published.) |
| Services | `Service` nodes for the three offerings, `provider` → the Person/business. |
| Blog post | **`Article`** (`BlogPosting`): headline, author (Person), datePublished, dateModified, image, mainEntityOfPage. Add **`FAQPage`** when `faq` present. |
| Blog index/category | `Blog` / `CollectionPage` + `BreadcrumbList`. |
| Testimonials | **`Review`** per story + **`AggregateRating`** on the business (only from real, consented ratings — never fabricate). |
| All deep pages | **`BreadcrumbList`** — **one per page, deduplicated** (no double breadcrumb nodes). |

> Reuse the breadcrumb + author + business nodes from one source so the same entity isn't
> described two different ways. Mismatched entities hurt AI extraction.

## Migration SEO (tie-in with 02 and 08)

- Keep titles/descriptions/canonicals for migrated posts aligned to what's indexed unless
  intentionally improving them (log changes at a gate).
- Submit the new `sitemap-index.xml` in GSC at launch; use "Validate fix" on the Pages
  report; monitor Coverage + Core Web Vitals reports weekly for the first 8 weeks.
- Watch for the failure mode from the prior migration: ensure **no** old-CMS URL form
  (e.g. `?p=`, `/?page_id=`, feed URLs, `wp-` paths) resolves with `200` on the new host
  — they should 301 or 410, never duplicate live content.

## POPIA (South Africa)

- `/privacy-policy/` page describing what the contact/newsletter forms collect, purpose,
  retention, and contact for data requests `[VERIFY wording with Grant]`.
- Explicit consent checkbox on both forms; no pre-ticked boxes.
- Cookie/consent banner **only if** analytics/marketing cookies are used. Prefer
  cookieless analytics (e.g. Plausible or Fathom) to avoid a banner
  entirely — faster and cleaner.
