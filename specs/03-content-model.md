# 03 — Content Model

All structured content uses **Astro Content Collections** with **Zod** schemas, authored
through **Keystatic**. One schema per collection; the schema is the contract. Keep schemas
strict (`.strict()` where practical) so unknown fields fail the build rather than ship.

## `posts` (blog / "Latest News")

`src/content/posts/*.mdx`

```ts
const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: ({ image }) => z.object({
    title: z.string().max(70),                 // keeps SEO titles sane
    slug: z.string(),                          // EXACT original WP slug — see 02
    pubDate: z.coerce.date(),                  // drives the date-based URL
    updatedDate: z.coerce.date().optional(),   // surfaced for freshness (AEO)
    excerpt: z.string().min(50).max(160),      // meta description + card text
    answer: z.string().max(320).optional(),    // 40–60 word answer-first lead (AEO, 05)
    categories: z.array(z.string()).min(1),    // e.g. ['fitness','lifestyle'] or ['plans/eating']
    heroImage: image(),                        // optimised via Astro Image
    heroAlt: z.string(),
    author: z.literal('grantbooysen').default('grantbooysen'),
    draft: z.boolean().default(false),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(), // FAQPage schema
  }),
});
```

- `categories` strings must match the canonical category paths in `02` (including nested
  `plans/eating`). Validate against a known list in `lib/categories.ts`; an unknown
  category fails the build.
- `draft: true` excludes from build, sitemap, and RSS.

## `testimonials` (NEW — before/after stories)

`src/content/testimonials/*.mdx`

```ts
const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/testimonials' }),
  schema: ({ image }) => z.object({
    clientName: z.string(),                    // may be first name / initial for privacy
    headline: z.string().max(80),              // "Down 18kg in 6 months"
    summary: z.string().max(200),              // card + meta
    program: z.enum(['personal-training','lifestyle-coaching','corporate-wellness']),
    durationWeeks: z.number().int().positive().optional(),
    beforeImage: image().optional(),
    afterImage: image().optional(),
    imageAlt: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),   // feeds Review/AggregateRating (05)
    consent: z.boolean(),                          // MUST be true to publish (POPIA)
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }).refine(d => d.consent === true, { message: 'Testimonial cannot publish without consent' }),
});
```

> **Privacy gate:** before/after photos and named results are personal data. A
> testimonial only builds/publishes when `consent: true`, representing documented written
> consent from the client. This is enforced in schema *and* checked at a human gate.
> Use first name or initial unless full name is explicitly consented.

## Singletons (Keystatic singletons, rendered into sections)

- **`homepage`** — hero heading/subheading, the rotating service words
  (`NUTRITION | 1 ON 1 TRAINING | FAT LOSS | ...`), about-me body, CTA labels.
- **`services`** — the three service cards (title, blurb, bullet list, image, CTA).
  Source of truth so the home Services section and any future `/services/` page share it.
- **`credentials`** — partner/cert logos (Precision Nutrition, Kettlebells for Africa,
  Advanced Coaching Academy, REPSSA, Virgin Active) with alt text + link.
- **`siteSettings`** — name, tagline, contact email/phone `[VERIFY]`, hours, social
  links, address/geo for LocalBusiness schema `[VERIFY]`, default OG image.

## Authoring rules (DRY content)

- Content is written once and referenced — e.g. service blurbs come only from the
  `services` singleton; never duplicate them in a page template.
- Images live in `src/assets/` (or Keystatic-managed `src/assets/`), are imported, and
  pass through Astro Image. No raw `/public` content images except favicons/OG fallback.
- Every post should carry an `answer` (40–60 words) and, where natural, a short `faq`
  block — both feed the AEO strategy in `05` and cost nothing if absent.
- Migrate existing post bodies from WordPress as clean MDX: strip Elementor wrappers,
  fix heading hierarchy (one `<h1>` = the title, body starts at `<h2>`), re-link internal
  links to new paths, re-import images. Flag anything ambiguous `[VERIFY]`.
