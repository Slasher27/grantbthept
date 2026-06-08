import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { postUrl } from '../lib/url';

// /rss.xml — feed of published posts, newest first (specs/05). A file extension
// route, so trailingSlash:'always' doesn't apply. Linked from <head> in BaseHead.
export async function GET(context: APIContext) {
  const posts = (await getCollection('posts'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  return rss({
    title: 'Grant Booysen Personal Trainer — Latest News',
    description:
      'Training, nutrition and lifestyle articles from Cape Town personal trainer Grant Booysen.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.excerpt,
      link: postUrl(p.data.pubDate, p.id.split('/')[0]),
    })),
  });
}
