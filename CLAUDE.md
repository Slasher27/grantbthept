# CLAUDE.md — Operating Rules

You are building the Grant Booysen PT website. This file governs how you work. The
numbered specs in this folder are the requirements; this file is the *method*.

## Prime directives

1. **Preserve URLs.** Before changing anything that affects routing, re-read
   `02-architecture-and-urls.md`. A broken or duplicated indexed URL is a launch blocker.
2. **DRY, lean, no bloat.** Reuse before you write. One layout system, one token source,
   one utility module per concern. If you copy a block twice, extract it. Do not add a
   dependency without justifying it in the PR/commit message against an existing capability.
3. **No speculative code.** Build what the specs ask for, nothing more. No commented-out
   code, no "just in case" abstractions, no dead exports.
4. **Human acceptance gates.** Content with `[VERIFY]` flags and any destructive/SEO-
   sensitive change (redirects, sitemap, robots, canonical) must stop for review. State
   clearly: "Acceptance gate — needs human confirmation: …".

## Minimal-code mandate (non-negotiable)

Default to the SIMPLEST implementation that satisfies the spec and the Definition of Done.
Complexity must earn its place — the bar is "the least code that fully solves it," not
"the most flexible thing I can build."

- Rule of three: no abstraction, helper, or generalisation until there are 3 real,
  current uses. No "we might need it later." Build for today's spec only.
- Prefer the platform over a library: CSS over JS, Astro/HTML built-ins over add-ons,
  a few lines of vanilla over a dependency. Do not add a package if ~15 lines do the job.
- No wrapper components around a single element. No util file for one function used once.
  No config/options nobody asked for. No defensive layers for hypothetical inputs.
- When two approaches both work, pick the one with less code and fewer moving parts —
  even if the other is "cleaner architecture." Fewer moving parts IS the cleaner choice here.
- Delete, don't comment out. No dead code, no TODO scaffolding, no unused exports/imports.
- Before adding any new file, dependency, or abstraction, state in one line why the
  simpler inline version doesn't work. If you can't justify it briefly, don't add it.
- If a component or function grows past what's readable at a glance, that's a smell —
  simplify, don't add structure to manage the complexity.

When in doubt: write less. The reviewer would rather see 20 obvious lines than 8 clever ones.

## Stack conventions (see 01 for the full list)

- **Astro 6.4.x**, output `static`, `trailingSlash: 'always'`, `build.format: 'directory'`.
- **Tailwind CSS v4** via `@tailwindcss/vite`. Tokens live in one `@theme` block — see `04`.
- **No TypeScript type annotations inside `.astro` template expressions.** Keep all logic
  in the frontmatter (`---` fence); the template is for output only.
- **MDX** for blog/testimonial bodies. **Astro Content Collections** for all structured
  content with **Zod** schemas (see `03`).
- **Astro Image** (`<Image>` / `<Picture>`) for every raster image. Never a raw `<img>`
  for content images.
- **Astro 6 Fonts API** for self-hosted fonts (no third-party font CDN). See `04`/`06`.
- **Astro 6 CSP API** for Content-Security-Policy. See `06`.

## Code style

- Components: `PascalCase.astro` in `src/components/`, grouped by domain
  (`layout/`, `sections/`, `blog/`, `ui/`). One component = one responsibility.
- No inline styles except dynamic values that can't be tokens. No magic numbers — use
  spacing/scale tokens.
- JS: vanilla + minimal Alpine.js only where interactivity is genuinely needed (mobile
  nav, form UX, testimonial before/after slider). No client framework islands unless a
  spec calls for one. Prefer zero-JS by default.
- Accessibility is part of "done", not a later pass (see `06`).

## Definition of done (every page/component)

- [ ] Renders at the correct URL with the correct trailing slash.
- [ ] Lighthouse (mobile, throttled): Performance ≥ 95, A11y = 100, Best Practices = 100,
      SEO = 100. CWV: LCP ≤ 2.0s, INP ≤ 200ms, CLS ≤ 0.05.
- [ ] Valid structured data (Rich Results Test passes) where the page type calls for it.
- [ ] No console errors/warnings. No unused CSS/JS shipped.
- [ ] Keyboard-navigable, visible focus, correct landmarks/headings, alt text.
- [ ] Responsive 320 → 1920px with no layout shift or overflow.

## When unsure

Ask. Do not guess business facts, contact details, prices, or which old URL maps where.
Surface the question at an acceptance gate rather than inventing an answer.
