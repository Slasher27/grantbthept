import type { CollectionEntry } from 'astro:content';

// Related posts (specs/05): rank other posts by shared category count, then recency.
// Single source so the post template and any future "more like this" stay consistent.
export function relatedPosts(
  all: CollectionEntry<'posts'>[],
  current: CollectionEntry<'posts'>,
  limit = 3,
): CollectionEntry<'posts'>[] {
  const currentCats = new Set(current.data.categories);
  return all
    .filter((p) => p.id !== current.id && !p.data.draft)
    .map((p) => ({
      post: p,
      shared: p.data.categories.filter((c) => currentCats.has(c)).length,
    }))
    .sort(
      (a, b) =>
        b.shared - a.shared || b.post.data.pubDate.getTime() - a.post.data.pubDate.getTime(),
    )
    .slice(0, limit)
    .map((x) => x.post);
}
