import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { db } from '@/server/db/client';
import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const rows = await db.query`
    SELECT 
      id, title, slug, category, excerpt, content, cover_image_url, 
      author_name, published_at
    FROM public.posts
    WHERE slug = ${params.slug} AND deleted_at IS NULL AND is_published = true
    LIMIT 1
  `;

  if (rows.length === 0) {
    notFound();
  }

  const post = rows[0];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/#berita"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Article Container */}
        <article className="space-y-6">
          {/* Header Metadata */}
          <div className="space-y-3 pb-6 border-b border-neutral-200">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-mono font-semibold bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
              <Tag className="w-3 h-3 text-neutral-500" />
              {post.category}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-black leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 font-mono">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                {post.author_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                {new Date(post.published_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="aspect-[16/9] w-full bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Lead Paragraph / Excerpt */}
          <div className="text-sm sm:text-base font-medium text-neutral-800 leading-relaxed border-l-2 border-black pl-4 py-1">
            {post.excerpt}
          </div>

          {/* Main Article Body */}
          <div className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line space-y-4 pt-2">
            {post.content}
          </div>

          {/* Bottom Navigation */}
          <div className="pt-8 border-t border-neutral-200 flex justify-between items-center">
            <Link
              href="/#berita"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-semibold rounded transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>

            <Link
              href="/#dokumen"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-semibold rounded transition-colors min-h-[44px]"
            >
              <span>Unduh Juknis</span>
            </Link>
          </div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
