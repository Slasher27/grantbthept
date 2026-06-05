// JSON-LD node builders (specs/05). One source for every entity so the same person /
// business is described once and referenced by @id everywhere — mismatched entities
// hurt AI extraction. Emitted through components/layout/Schema.astro; never hand-written
// in templates. Each node reflects only what's visible on the page.
import siteSettings from '../content/singletons/site-settings.json';
import services from '../content/singletons/services.json';
import { author } from './author';
import { isoDate } from './dates';

const SITE_NAME = 'Grant Booysen Personal Trainer';

const abs = (path: string, site: URL) => new URL(path, site).href;

/** Stable @id anchors hung off the site origin. */
export function ids(site: URL) {
  const o = site.origin;
  return { website: `${o}/#website`, person: `${o}/#person`, business: `${o}/#business` };
}

export function websiteNode(site: URL) {
  const id = ids(site);
  return {
    '@type': 'WebSite',
    '@id': id.website,
    url: abs('/', site),
    name: SITE_NAME,
    inLanguage: 'en-ZA',
    publisher: { '@id': id.person },
  };
}

export function personNode(site: URL) {
  const id = ids(site);
  return {
    '@type': 'Person',
    '@id': id.person,
    name: author.name,
    jobTitle: 'Personal Trainer & Lifestyle Coach',
    description: author.bio,
    url: abs(author.url, site),
    worksFor: { '@id': id.business },
    areaServed: { '@type': 'City', name: 'Cape Town' },
    knowsAbout: [
      'Personal training',
      'Strength and conditioning',
      'Nutrition coaching',
      'Lifestyle coaching',
      'Corporate wellness',
    ],
    memberOf: {
      '@type': 'Organization',
      name: 'Register of Exercise Professionals South Africa (REPSSA)',
    },
    sameAs: siteSettings.social.map((s) => s.url),
  };
}

export function businessNode(site: URL) {
  const id = ids(site);
  // NAP comes from site-settings.json. The phone/address/geo there are DUMMY [VERIFY]
  // placeholders for now — Grant confirms the real values before production (specs/08).
  const [streetAddress, addressLocality, postalCode] = siteSettings.address.split(', ');
  const [latitude, longitude] = siteSettings.geo.split(',').map(Number);
  return {
    '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
    '@id': id.business,
    name: siteSettings.name,
    description: siteSettings.tagline,
    url: abs('/', site),
    email: siteSettings.contactEmail,
    telephone: siteSettings.contactPhone,
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality,
      postalCode,
      addressCountry: 'ZA',
    },
    geo: { '@type': 'GeoCoordinates', latitude, longitude },
    areaServed: { '@type': 'City', name: 'Cape Town' },
    founder: { '@id': id.person },
    sameAs: siteSettings.social.map((s) => s.url),
  };
}

export function serviceNodes(site: URL) {
  const id = ids(site);
  return services.items.map((s) => ({
    '@type': 'Service',
    name: s.title,
    description: s.blurb,
    serviceType: s.title,
    provider: { '@id': id.business },
    areaServed: { '@type': 'City', name: 'Cape Town' },
  }));
}

/** Home / about: the full entity graph (WebSite + Person + LocalBusiness + Services). */
export function homeGraph(site: URL) {
  return [websiteNode(site), personNode(site), businessNode(site), ...serviceNodes(site)];
}

interface ArticleInput {
  url: string;
  title: string;
  description: string;
  datePublished: Date;
  dateModified: Date;
  image: string;
  faq?: { q: string; a: string }[];
}

/** Blog post: BlogPosting (+ FAQPage when the post has an faq), authored by the Person. */
export function articleGraph(site: URL, a: ArticleInput) {
  const id = ids(site);
  const canonical = abs(a.url, site);
  const article = {
    '@type': 'BlogPosting',
    headline: a.title,
    description: a.description,
    datePublished: isoDate(a.datePublished),
    dateModified: isoDate(a.dateModified),
    image: abs(a.image, site),
    author: { '@id': id.person },
    publisher: { '@id': id.person },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
    inLanguage: 'en-ZA',
  };
  const graph: unknown[] = [personNode(site), article];
  if (a.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: a.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  return graph;
}

/** Blog index (Blog) and category / author / testimonials archives (CollectionPage). */
export function collectionGraph(
  site: URL,
  o: { type: 'Blog' | 'CollectionPage'; path: string; name: string; description: string },
) {
  return [
    {
      '@type': o.type,
      '@id': abs(o.path, site),
      url: abs(o.path, site),
      name: o.name,
      description: o.description,
      isPartOf: { '@id': ids(site).website },
      inLanguage: 'en-ZA',
    },
  ];
}

interface ReviewInput {
  clientName: string;
  headline: string;
  summary: string;
  rating?: number;
}

/** Testimonial detail: a single Review of the business. */
export function reviewGraph(site: URL, r: ReviewInput) {
  const review = {
    '@type': 'Review',
    itemReviewed: { '@id': ids(site).business },
    name: r.headline,
    reviewBody: r.summary,
    author: { '@type': 'Person', name: r.clientName },
    ...(r.rating
      ? { reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 } }
      : {}),
  };
  return [businessNode(site), review];
}

interface BreadcrumbItem {
  name: string;
  item?: string;
}

/** One BreadcrumbList per page, built from the same crumbs the page renders. */
export function breadcrumbNode(site: URL, items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.item ? { item: abs(c.item, site) } : {}),
    })),
  };
}
