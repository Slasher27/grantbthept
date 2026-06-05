// Date display helpers. en-ZA locale → "5 June 2026". Used by post cards, the post
// template meta row, and archives (single source so formatting never drifts).
const display = new Intl.DateTimeFormat('en-ZA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatDate(date: Date): string {
  return display.format(date);
}

/** Machine-readable YYYY-MM-DD for <time datetime> + schema. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
