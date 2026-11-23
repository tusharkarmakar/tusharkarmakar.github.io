import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Ratios offered in the portal. "auto" keeps the file's own shape.
export const RATIOS = ['auto', '1:1', '4:5', '3:4', '2:3', '3:2', '4:3', '16:9', '9:16', '21:9'] as const;

const media = z.object({
  type: z.enum(['image', 'link']).default('image'),
  image: z.string().optional().nullable(),   // uploaded file (also used as poster for links)
  url: z.string().optional().nullable(),     // YouTube, Vimeo, .mp4, Lottie, Behance, Instagram…
  ratio: z.enum(RATIOS).default('auto'),
  width: z.enum(['full', 'half', 'third']).default('full'),
  caption: z.string().optional().nullable(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional().nullable(),
    client: z.string().optional().nullable(),
    year: z.coerce.string().optional().nullable(),
    role: z.string().optional().nullable(),
    agency: z.string().optional().nullable(),
    categories: z.array(z.enum(['campaign', 'motion', 'branding', 'social', 'ai'])).default([]),
    tag: z.string().optional().nullable(),         // short label under the thumbnail
    cover: z.string(),
    coverFocus: z.enum(['top', 'center', 'bottom']).default('center'),
    order: z.number().default(100),
    featured: z.boolean().default(false),          // show on the home page
    draft: z.boolean().default(false),
    media: z.array(media).default([]),
  }),
});

export const collections = { projects };
