/**
 * URL / path builders. The post URL is derived from the post's pubDate + original
 * slug so every path is reproducible and stable (see specs/02). Zero-pad month/day.
 */

export function zeroPad(n: number): string {
  return String(n).padStart(2, '0');
}

export interface PostRouteParams {
  year: string;
  month: string;
  day: string;
  slug: string;
}

/** Date-based route params for /[year]/[month]/[day]/[slug]/. */
export function postRouteParams(pubDate: Date, slug: string): PostRouteParams {
  return {
    year: String(pubDate.getUTCFullYear()),
    month: zeroPad(pubDate.getUTCMonth() + 1),
    day: zeroPad(pubDate.getUTCDate()),
    slug,
  };
}

/** Canonical post URL with trailing slash. */
export function postUrl(pubDate: Date, slug: string): string {
  const { year, month, day } = postRouteParams(pubDate, slug);
  return `/${year}/${month}/${day}/${slug}/`;
}
