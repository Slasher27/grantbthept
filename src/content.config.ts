import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { categorySlugs } from './lib/categories';

// Blog posts ("Latest News"). The exact original WP slug + pubDate drive the
// date-based URL (see specs/02). Categories must match the registry in lib/categories.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      slug: z.string(), // EXACT original WP slug — never regenerated from title
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

// Before/after transformation stories. A testimonial only builds when consent
// is true — personal data must not publish without documented consent (POPIA).
const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/testimonials' }),
  schema: ({ image }) =>
    z
      .object({
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
      })
      .refine((d) => d.consent === true, {
        message: 'Testimonial cannot publish without consent',
      }),
});

export const collections = { posts, testimonials };
