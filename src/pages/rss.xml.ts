import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../../site.config';
import { postPath, sortByDateDesc } from '../lib/posts';
import { withBase } from '../lib/url';

export async function GET(context: APIContext) {
  const posts = sortByDateDesc(await getCollection('posts', ({ data }) => !data.draft));
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: new URL(import.meta.env.BASE_URL, context.site ?? 'http://localhost:4321').href,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: withBase(postPath(post.id)),
    })),
  });
}
