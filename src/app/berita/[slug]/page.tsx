import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag, Download } from 'lucide-react';
import { db } from '@/server/db/client';
import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';
import { MobileBottomNav } from '@/components/public/mobile-bottom-nav';

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
    <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-amber-200">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/#berita"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors min-h-[44px] py-2 focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Warta & Pengumuman</span>
          </Link>
        </div>

        {/* Article Container */}
        <article className="space-y-6 bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          {/* Header Metadata */}
          <div className="space-y-3 pb-6 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">۞</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-semibold bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                {post.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-mono">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>{post.author_name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {new Date(post.published_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="aspect-[16/9] w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Lead Paragraph / Excerpt */}
          <div className="text-sm sm:text-base font-semibold text-emerald-950 leading-relaxed border-l-4 border-emerald-600 bg-emerald-50/50 p-4 rounded-r-2xl shadow-xs">
            {post.excerpt}
          </div>

          {/* Main Article Body */}
          <div className="text-sm sm:text-base text-neutral-800 leading-relaxed whitespace-pre-line space-y-4 pt-2">
            {post.content}
          </div>

          {/* Bottom Navigation */}
          <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <Link
              href="/#berita"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>

            <Link
              href="/#dokumen"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm min-h-[44px]"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Unduh Juknis Resmi</span>
              <span className="text-amber-300">۞</span>
            </Link>
          </div>
        </article>
      </main>

      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}
