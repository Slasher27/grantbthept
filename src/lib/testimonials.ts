import type { CollectionEntry } from 'astro:content';

// Testimonial helpers — labels + URL/slug builders shared by the grid card and the
// detail page (specs/02 adds /testimonials/<slug>/). The slug is the entry's folder
// name (same convention as posts).
export const PROGRAM_LABELS: Record<string, string> = {
  'personal-training': 'Personal Training',
  'lifestyle-coaching': 'Lifestyle Coaching',
  'corporate-wellness': 'Corporate Wellness',
};

export function testimonialSlug(t: CollectionEntry<'testimonials'>): string {
  return t.id.split('/')[0];
}

export function testimonialUrl(t: CollectionEntry<'testimonials'>): string {
  return `/testimonials/${testimonialSlug(t)}/`;
}
