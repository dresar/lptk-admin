import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(255, 'Judul maksimal 255 karakter'),
  slug: z.string().min(3, 'Slug minimal 3 karakter').max(255, 'Slug maksimal 255 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)'),
  category: z.string().min(2, 'Kategori minimal 2 karakter').max(100),
  excerpt: z.string().min(10, 'Ringkasan minimal 10 karakter').max(500, 'Ringkasan maksimal 500 karakter'),
  content: z.string().min(20, 'Konten artikel minimal 20 karakter'),
  cover_image_url: z.string().optional().nullable(),
  gallery_images: z.array(z.string()).max(5, 'Maksimal 5 gambar galeri').optional().default([]),
  video_url: z.string().optional().nullable(),
  meta_title: z.string().max(255).optional().nullable(),
  meta_description: z.string().optional().nullable(),
  meta_keywords: z.string().max(255).optional().nullable(),
  content_format: z.enum(['markdown', 'html']).optional().default('markdown'),
  author_name: z.string().max(150).optional().default('Sekretariat LPTQ'),
  is_published: z.boolean().default(true),
  published_at: z.string().optional(),
});

export const updatePostSchema = createPostSchema.partial();

