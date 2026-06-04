/**
 * Canonical category registry — the single source of truth for blog categories.
 *
 * A category `slug` is a URL *path* (it may contain `/`, e.g. `plans/eating` for the
 * nested category at /category/plans/eating/). The post schema in content.config.ts
 * validates every post category against this list, so an unknown category fails the
 * build rather than shipping a dead /category/ URL (see specs/02 + specs/03).
 *
 * Confirm the full list against the GSC export at Gate A before launch.
 */

export interface Category {
  /** URL path segment(s) under /category/ — e.g. 'fitness' or 'plans/eating'. */
  slug: string;
  /** Human-readable label for badges, archive headings, breadcrumbs. */
  name: string;
}

export const categories: Category[] = [
  { slug: 'fitness', name: 'Fitness' },
  { slug: 'lifestyle', name: 'Lifestyle' },
  { slug: 'recipes', name: 'Recipes' },
  { slug: 'plans', name: 'Plans' },
  { slug: 'plans/eating', name: 'Eating Plans' },
  { slug: 'plans/workout', name: 'Workout Plans' }, // discovered live (/category/plans/workout/) — preserve [VERIFY at gate]
];

export const categorySlugs = categories.map((c) => c.slug);

export function isValidCategory(slug: string): boolean {
  return categorySlugs.includes(slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
