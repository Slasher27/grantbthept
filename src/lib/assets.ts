import type { ImageMetadata } from 'astro';

// Resolve a Keystatic singleton image path (stored in JSON as e.g.
// "/src/assets/home/hero.jpg") to the ImageMetadata that Astro's <Image> needs.
// Singleton images are path strings (not per-entry static imports), so we map every
// asset at build via a glob and look the path up. Returns undefined when unset, so
// callers can fall back gracefully. Shared by hero / profile / service / logo / OG images.
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true }
);

export function resolveImage(path: string | null | undefined): ImageMetadata | undefined {
  if (!path) return undefined;
  return images[path]?.default;
}
