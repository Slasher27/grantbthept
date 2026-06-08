// Phase 4 QA: run axe-core (WCAG 2.2 AA) on every template + capture console/CSP
// violations. Serves the built `dist/` statically and drives it with Playwright.
// Run: `npm run build` first, then `node scripts/qa.mjs`. (specs/06 a11y gate)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const DIST = join(process.cwd(), 'dist');
const PORT = 4321;

const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
};

// Static server: resolve a request path to a file, defaulting directories to index.html.
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    else if (!extname(p)) p += '/index.html';
    const buf = await readFile(join(DIST, p));
    res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

// One representative URL per template type (specs/07).
const ROUTES = [
  ['home', '/'],
  ['news (archive)', '/news/'],
  ['post', '/2023/06/05/motivation/'],
  ['post (nutrition+faq)', '/2022/09/16/healthy-eating-plan/'],
  ['category', '/category/fitness/'],
  ['category (nested)', '/category/plans/eating/'],
  ['author', '/author/grantbooysen/'],
  ['testimonials', '/testimonials/'],
  ['testimonial detail', '/testimonials/sarah-m/'],
  ['privacy policy', '/privacy-policy/'],
  ['404', '/404.html'],
];

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch();
let totalViolations = 0;
let totalConsole = 0;

const context = await browser.newContext();
for (const [label, path] of ROUTES) {
  const page = await context.newPage();
  const consoleErrors = [];
  // Ignore the generic "Failed to load resource" line (no URL); capture real errors
  // and CSP violations from the console, plus any non-Netlify 4xx/5xx by URL. The
  // Netlify Image CDN (/.netlify/images?...) only resolves on Netlify, so its 404s
  // locally are a serving artifact, not a bug — excluded.
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (t.startsWith('Failed to load resource')) return;
    consoleErrors.push(t);
  });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('/.netlify/')) {
      consoleErrors.push(`${r.status()} ${new URL(r.url()).pathname}`);
    }
  });

  await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const a11y = violations.reduce((n, v) => n + v.nodes.length, 0);
  totalViolations += a11y;
  totalConsole += consoleErrors.length;

  const status = a11y === 0 && consoleErrors.length === 0 ? 'PASS' : 'FAIL';
  console.log(`\n[${status}] ${label}  (${path})`);
  for (const v of violations) {
    console.log(`  a11y · ${v.id} (${v.impact}) ×${v.nodes.length} — ${v.help}`);
    for (const n of v.nodes) console.log(`         ${n.target.join(' ')}`);
  }
  for (const c of consoleErrors) console.log(`  console · ${c}`);
  await page.close();
}

await browser.close();
server.close();
console.log(`\n=== ${totalViolations} a11y violations, ${totalConsole} console errors across ${ROUTES.length} templates ===`);
process.exit(totalViolations + totalConsole === 0 ? 0 : 1);
