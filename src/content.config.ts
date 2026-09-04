import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_KEYS, type Category } from './lib/categories';
import { AFFILIATE_PROVIDERS } from './lib/affiliate';

const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(10).max(80),
    description: z.string().min(40).max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(CATEGORY_KEYS as [Category, ...Category[]]),
    tags: z.array(z.string()).default([]),
    affiliate: z.array(z.enum(AFFILIATE_PROVIDERS)).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
