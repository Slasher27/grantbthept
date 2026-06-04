# 06 — Performance & Accessibility

These are **gates**, not goals. CI fails the build if a budget is missed (see `08`).

## Core Web Vitals targets (mobile, throttled, 75th percentile)

| Metric | Target | Notes |
|--------|--------|-------|
| LCP | ≤ 2.0s | Hero image is the usual LCP element — preload it, size it, modern format. |
| INP | ≤ 200ms | Replaced FID. Keep JS tiny; no heavy main-thread work. |
| CLS | ≤ 0.05 | Every image/embed has explicit dimensions; fonts use `size-adjust`. |
| TTFB | ≤ 0.6s | Static + edge CDN (Netlify) makes this easy. |

Lighthouse (mobile): **Performance ≥ 95, Accessibility = 100, Best Practices = 100,
SEO = 100** on every template.

## Performance budget (per page, gzipped)

- HTML ≤ 30 KB · CSS ≤ 30 KB · JS ≤ **20 KB** (Alpine + page glue only) ·
  Fonts ≤ 120 KB total (2 families, subset) · Hero image ≤ 150 KB.
- **Zero JS on pages that don't need it.** The blog post template should ship ~0 KB JS.
  Interactivity (nav, slider, forms) is Alpine, loaded only where used.

## Images

- Astro `<Image>`/`<Picture>` for all content images. Formats: **AVIF + WebP** with a
  raster fallback. Responsive `widths` matched to layout; `sizes` set correctly.
- LCP/hero image: `loading="eager"` + `fetchpriority="high"` + `<link rel="preload">`.
  Everything below the fold: `loading="lazy"` + `decoding="async"`.
- Always set width/height (intrinsic) to reserve space → no CLS.
- Re-export the migrated WordPress images at correct sizes; drop the WP `-768x402` etc.
  derivative soup and let Astro generate the set.

## Fonts

- Self-host via **Astro 6 Fonts API**. Subset to used glyphs (Latin). `font-display: swap`.
- Preload the body font; declare `size-adjust`/metric overrides to prevent layout shift on
  swap. Max two families, limited weights (display: 1–2 heavy; body: regular + semibold).

## CSS/JS hygiene (DRY = performance)

- Tailwind v4 ships only used utilities; no separate hand-written stylesheet beyond the
  token `@theme` + a few base rules. No unused CSS, no `!important` battles.
- No render-blocking third-party scripts. Analytics async/deferred and cookieless.
- One Alpine instance; components register their own behaviour. No duplicate scripts.

## Security headers (Astro 6 CSP API)

- Enable the built-in **Content-Security-Policy** (nonce-based for any inline). Plus
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`,
  `Permissions-Policy` (lock down camera/mic/geo), HSTS at the host.
- Forms: Altcha + honeypot; never echo user input unsanitised.

## Accessibility — WCAG 2.2 AA (gate: axe = 0 violations)

- Semantic landmarks (`header/nav/main/footer`), one `<h1>`/page, logical heading order.
- Keyboard: everything operable, **visible focus** styles (not removed), logical tab order,
  skip-to-content link (the live site already has `#main` — keep it).
- Colour contrast AA against the **sampled** palette; never rely on colour alone (e.g.
  category badges have text, not just colour).
- Images: meaningful `alt`; decorative `alt=""`. Icons that act as buttons get accessible
  names. Form fields have real `<label>`s, errors announced (`aria-live`), required state
  conveyed in text not just colour.
- Motion respects `prefers-reduced-motion`. Target sizes ≥ 24px (WCAG 2.2). Mobile nav
  is a real, focus-trapped, escape-closable disclosure.
- Test: automated **axe** in CI + manual keyboard + screen-reader pass (VoiceOver/NVDA) at
  the launch gate.
