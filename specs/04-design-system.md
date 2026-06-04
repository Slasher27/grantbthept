# 04 — Design System

**Direction:** *refined athletic minimalism.* Lots of negative space, strong typographic
contrast, a near-monochrome base (matching the existing black/white logo identity) lifted
by **one** energetic accent. Editorial, confident, calm — not a gym-flyer with neon and
gradients. Per the brief: minimalist, Tailwind v4, fitness theme, existing brand colours.

## Colour — sample first, then tokenise

The existing site's exact palette could not be extracted remotely. **Before coding,
sample the live site** (DevTools → computed styles on the logo, the "Contact Me" button,
body text, links, section backgrounds) and record the real hex values. Those become the
tokens below. The values here are a sensible default *to be overwritten by the sampled
brand colours* — do not invent a new palette if the brand already has one.

Define tokens once, in `src/styles/global.css`, as Tailwind v4 `@theme`:

```css
@import "tailwindcss";

@theme {
  /* Brand — REPLACE with sampled values from the live site */
  --color-ink:        #0f0f10;   /* near-black: logo, headlines, body on light */
  --color-paper:      #fafaf8;   /* off-white page background (not pure #fff) */
  --color-surface:    #ffffff;   /* cards */
  --color-muted:      #6b6b70;   /* secondary text */
  --color-line:       #e6e6e2;   /* hairlines / borders */
  --color-accent:     #c8412b;   /* SINGLE energetic accent — match brand */
  --color-accent-ink: #ffffff;   /* text on accent */
  --color-dark:       #131316;   /* dark sections (hero/footer) */

  /* Type scale (fluid, clamp-based) */
  --text-xs:  clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem);
  --text-sm:  clamp(0.875rem, 0.85rem + 0.2vw, 0.9375rem);
  --text-base:clamp(1rem, 0.96rem + 0.25vw, 1.0625rem);
  --text-lg:  clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --text-xl:  clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  --text-2xl: clamp(2.5rem, 1.8rem + 3vw, 4.5rem);   /* hero */

  /* Spacing rhythm — 4px base, used everywhere (no magic numbers) */
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem; --space-8: 2rem; --space-12: 3rem; --space-16: 4rem;
  --space-24: 6rem; --space-32: 8rem;

  --radius: 0.5rem;
  --container: 72rem;     /* max content width */
}
```

> One token source. Components consume tokens (`text-ink`, `bg-paper`, `text-accent`, …).
> No raw hex in components, no per-component colour. Contrast must pass WCAG AA (≥ 4.5:1
> body, ≥ 3:1 large text / UI) — verify the **sampled** accent; adjust shade if it fails.

## Typography — distinctive, not default

Avoid Inter/Roboto/Arial/system stacks. Pair a characterful display face with a clean,
highly legible body face. Self-host via the **Astro 6 Fonts API** (no Google CDN — better
privacy + CWV). Recommended default pairing (override only to match an existing brand font):

- **Display / headings:** **Archivo** (or its expanded/condensed cut) — athletic,
  architectural, strong at large sizes. Use heavy weights for the hero and section heads.
- **Body / UI:** **Hanken Grotesk** — warm, neutral, excellent reading texture at small
  sizes.

Rules: one `<h1>` per page; modular scale via the tokens above; generous line-height on
body (`1.6`), tight on display (`1.05`); never set body type below `--text-base` on mobile.

## Layout & composition

- 12-column fluid grid, `--container` max width, consistent section padding
  (`--space-24` desktop / `--space-16` mobile) via a single `<Section>` primitive.
- Use asymmetry and overlap deliberately in the hero and About (image bleeding past a
  column, oversized section numerals) — controlled, not chaotic. Everything else stays
  calm and aligned.
- Dark hero + dark footer (`--color-dark`), light content in between — gives the
  single-page home clear rhythm.

## Core components (`src/components/ui/`)

`Section`, `Container`, `Button` (variants: solid-accent, outline, ghost), `Prose`
(typographic wrapper for MDX), `Badge` (category), `Card`. Build these once; every
section composes them. If a section needs a one-off style, justify it — otherwise extend a
primitive.

## Motion (restraint)

- One orchestrated **page-load reveal** on the hero (staggered `animation-delay`), CSS-only.
- Subtle scroll-reveal on section entry (`IntersectionObserver`, ~12px rise + fade,
  ≤ 400ms). Respect `prefers-reduced-motion: reduce` — disable all non-essential motion.
- Hover: accent underline grow on links, slight lift on cards. No parallax, no
  auto-playing carousels, no scroll-jacking.

## Imagery

- Athletic, candid, real (training, movement, food). Consistent treatment (slightly
  desaturated, warm). All via Astro Image (`04`/`06`). Decorative images get empty `alt`.
- Before/after testimonial images: equal crop/aspect, labelled, never distorted.
