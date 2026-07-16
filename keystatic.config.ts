import { config, fields, collection, singleton } from '@keystatic/core';
import { categories } from './src/lib/categories';

const categoryOptions = categories.map((c) => ({ label: c.name, value: c.slug }));

// Git-based CMS on Keystatic Cloud: the admin authenticates against Keystatic Cloud and
// commits MDX/JSON to the GitHub repo (Slasher27/grantbthept), which triggers a Netlify
// rebuild. Cloud (not `local`) is what lets the DEPLOYED /keystatic work and lets Grant
// edit by email invite without a GitHub account. Collections + singletons mirror specs/03.
export default config({
  storage: { kind: 'cloud' },
  cloud: { project: 'grantbthept/website' },
  ui: {
    brand: { name: 'Grant Booysen PT' },
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*/',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'pubDate'],
      schema: {
        // The slug (URL-editable here) is the entry's folder name and drives the
        // date-based URL (specs/02). Keep it stable — for migrated posts it must
        // stay the exact original WP slug, or the legacy URL breaks.
        title: fields.slug({
          name: { label: 'Title', validation: { length: { max: 70 } } },
        }),
        pubDate: fields.date({
          label: 'Publish date',
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({ label: 'Updated date' }),
        excerpt: fields.text({
          label: 'Excerpt',
          multiline: true,
          validation: { length: { min: 50, max: 160 } },
        }),
        answer: fields.text({
          label: 'Answer-first lead (40–60 words, AEO)',
          multiline: true,
          validation: { length: { max: 320 } },
        }),
        categories: fields.multiselect({
          label: 'Categories',
          options: categoryOptions,
        }),
        // No directory/publicPath → Keystatic stores the upload beside the entry
        // (src/content/posts/<slug>/) and writes a ./hero.<ext> path. Each post is
        // self-contained; Astro's image() in content.config.ts resolves the relative path.
        heroImage: fields.image({
          label: 'Hero image',
          validation: { isRequired: true },
        }),
        heroAlt: fields.text({
          label: 'Hero image alt text',
          validation: { isRequired: true },
        }),
        author: fields.select({
          label: 'Author',
          options: [{ label: 'Grant Booysen', value: 'grantbooysen' }],
          defaultValue: 'grantbooysen',
        }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        faq: fields.array(
          fields.object({
            q: fields.text({ label: 'Question' }),
            a: fields.text({ label: 'Answer', multiline: true }),
          }),
          { label: 'FAQ', itemLabel: (props) => props.fields.q.value },
        ),
        content: fields.mdx({ label: 'Body' }),
      },
    }),

    testimonials: collection({
      label: 'Testimonials',
      slugField: 'clientName',
      path: 'src/content/testimonials/*/',
      format: { contentField: 'content' },
      columns: ['clientName', 'headline'],
      schema: {
        clientName: fields.slug({
          name: { label: 'Client name (first name / initial for privacy)' },
        }),
        headline: fields.text({
          label: 'Headline',
          validation: { length: { max: 80 } },
        }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          validation: { length: { max: 200 } },
        }),
        program: fields.select({
          label: 'Program',
          options: [
            { label: 'Personal training', value: 'personal-training' },
            { label: 'Lifestyle coaching', value: 'lifestyle-coaching' },
            { label: 'Corporate wellness', value: 'corporate-wellness' },
          ],
          defaultValue: 'personal-training',
        }),
        durationWeeks: fields.integer({ label: 'Duration (weeks)' }),
        // Co-located beside the entry (src/content/testimonials/<slug>/), same as posts.
        beforeImage: fields.image({ label: 'Before image' }),
        afterImage: fields.image({ label: 'After image' }),
        imageAlt: fields.text({ label: 'Image alt text' }),
        rating: fields.integer({
          label: 'Rating (1–5)',
          validation: { min: 1, max: 5 },
        }),
        // POPIA: must be true to publish. Documented written consent required.
        consent: fields.checkbox({
          label: 'Client consent on file',
          defaultValue: false,
        }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
        content: fields.mdx({ label: 'Story' }),
      },
    }),
  },

  singletons: {
    homepage: singleton({
      label: 'Homepage',
      path: 'src/content/singletons/homepage',
      format: { data: 'json' },
      schema: {
        heroHeading: fields.text({ label: 'Hero heading' }),
        heroSubheading: fields.text({ label: 'Hero subheading', multiline: true }),
        rotatingWords: fields.array(fields.text({ label: 'Word' }), {
          label: 'Rotating service words',
          itemLabel: (props) => props.value,
        }),
        heroImage: fields.image({
          label: 'Hero background image',
          directory: 'src/assets/home',
          publicPath: '/src/assets/home/',
        }),
        ctaPrimaryLabel: fields.text({ label: 'Primary CTA label' }),
        ctaSecondaryLabel: fields.text({ label: 'Secondary CTA label' }),
      },
    }),

    about: singleton({
      label: 'About page',
      path: 'src/content/singletons/about',
      format: { data: 'json' },
      schema: {
        summary: fields.text({
          label: 'Summary (homepage teaser)',
          multiline: true,
        }),
        profileImage: fields.image({
          label: 'Profile photo',
          directory: 'src/assets/profile',
          publicPath: '/src/assets/profile/',
        }),
        profileAlt: fields.text({ label: 'Profile photo alt text' }),
        intro: fields.text({
          label: 'Intro (lead paragraphs on the About page)',
          multiline: true,
        }),
        sections: fields.array(
          fields.object({
            heading: fields.text({ label: 'Heading' }),
            body: fields.text({ label: 'Body', multiline: true }),
          }),
          { label: 'Sections', itemLabel: (props) => props.fields.heading.value }
        ),
      },
    }),

    services: singleton({
      label: 'Services',
      path: 'src/content/singletons/services',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Title' }),
            blurb: fields.text({ label: 'Blurb', multiline: true }),
            bullets: fields.array(fields.text({ label: 'Bullet' }), {
              label: 'Bullets',
              itemLabel: (props) => props.value,
            }),
            image: fields.image({
              label: 'Image',
              directory: 'src/assets/services',
              publicPath: '/src/assets/services/',
            }),
            ctaLabel: fields.text({ label: 'CTA label' }),
          }),
          { label: 'Service cards', itemLabel: (props) => props.fields.title.value },
        ),
      },
    }),

    credentials: singleton({
      label: 'Credentials',
      path: 'src/content/singletons/credentials',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            name: fields.text({ label: 'Name' }),
            logo: fields.image({
              label: 'Logo',
              directory: 'src/assets/credentials',
              publicPath: '/src/assets/credentials/',
            }),
            alt: fields.text({ label: 'Alt text' }),
            link: fields.url({ label: 'Link' }),
          }),
          { label: 'Credential logos', itemLabel: (props) => props.fields.name.value },
        ),
      },
    }),

    siteSettings: singleton({
      label: 'Site settings',
      path: 'src/content/singletons/site-settings',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Name' }),
        tagline: fields.text({ label: 'Tagline' }),
        contactEmail: fields.text({ label: 'Contact email' }),
        openingHours: fields.object(
          {
            days: fields.multiselect({
              label: 'Open days',
              options: [
                { label: 'Monday', value: 'Monday' },
                { label: 'Tuesday', value: 'Tuesday' },
                { label: 'Wednesday', value: 'Wednesday' },
                { label: 'Thursday', value: 'Thursday' },
                { label: 'Friday', value: 'Friday' },
                { label: 'Saturday', value: 'Saturday' },
                { label: 'Sunday', value: 'Sunday' },
              ],
            }),
            opens: fields.text({ label: 'Opens (24h, e.g. 06:00)' }),
            closes: fields.text({ label: 'Closes (24h, e.g. 18:00)' }),
          },
          { label: 'Opening hours' }
        ),
        social: fields.array(
          fields.object({
            platform: fields.text({ label: 'Platform' }),
            url: fields.url({ label: 'URL' }),
          }),
          { label: 'Social links', itemLabel: (props) => props.fields.platform.value },
        ),
        address: fields.text({ label: 'Address', multiline: true }),
        geo: fields.text({ label: 'Geo (lat,lng) [VERIFY] — leave blank until confirmed' }),
        ogImage: fields.image({
          label: 'Default OG image',
          directory: 'src/assets/og',
          publicPath: '/src/assets/og/',
        }),
      },
    }),
  },
});
