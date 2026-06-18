import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { categorySlugs } from './lib/categories';

// Blog posts ("Latest News"). The entry's folder name is the slug; that + pubDate
// drive the date-based URL (see specs/02). For migrated posts the folder is the
// exact original WP slug. Categories must match the registry in lib/categories.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      pubDate: z.coerce.date(), // drives the date-based URL
      updatedDate: z.coerce.date().optional(), // freshness signal (AEO)
      excerpt: z.string().min(50).max(160), // meta description + card text
      answer: z.string().max(320).optional(), // 40–60 word answer-first lead (AEO)
      categories: z
        .array(z.enum(categorySlugs as [string, ...string[]]))
        .min(1), // validated against the canonical registry
      heroImage: image(),
      heroAlt: z.string(),
      author: z.literal('grantbooysen').default('grantbooysen'),
      draft: z.boolean().default(false),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    }),
});

// Before/after transformation stories. POPIA consent is a *publish filter*, not a
// schema hard-fail: an unconsented entry must still LOAD (so authoring it in Keystatic —
// which defaults `consent` to false — never crashes dev/build), it just never renders.
// The pages that list/build testimonials filter `consent === true`, so no unconsented
// personal data ever publishes (no page, no card, no schema). See specs/03.
const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/testimonials' }),
  schema: ({ image }) =>
    z.object({
      clientName: z.string(), // may be first name / initial for privacy
      headline: z.string().max(80),
      summary: z.string().max(200),
      program: z.enum([
        'personal-training',
        'lifestyle-coaching',
        'corporate-wellness',
      ]),
      durationWeeks: z.number().int().positive().optional(),
      beforeImage: image().optional(),
      afterImage: image().optional(),
      imageAlt: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
      consent: z.boolean(),
      featured: z.boolean().default(false),
      order: z.number().default(0),
    }),
});

export const collections = { posts, testimonials };
