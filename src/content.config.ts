import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_KEYS, type Category } from './lib/categories';
import { AFFILIATE_PROVIDERS } from './lib/affiliate';

const photoSchema = z.object({
  src: z.string().regex(/^\/photos\/posts\/[a-z0-9-]+\.webp$/),
  alt: z.string().min(1).max(120),
  author: z.string().min(1),
  license: z.string().min(1),
  licenseUrl: z.string().url(),
  source: z.string().url(),
});

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
    /** 先頭の記事写真(scripts/photo.mjs で取り込む)。無ければ写真なしで表示する */
    photo: photoSchema.optional(),
    /** 本文中に置く写真。本文の単独段落に [[photo:id]] と書いた位置に展開される */
    photos: z.array(photoSchema.extend({ id: z.string().regex(/^[a-z0-9-]+$/) })).default([]),
  }),
});

export const collections = { posts };
