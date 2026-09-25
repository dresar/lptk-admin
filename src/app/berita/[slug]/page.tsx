import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag, Download, Images, PlayCircle } from 'lucide-react';
import { db } from '@/server/db/client';
import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';
import { MobileBottomNav } from '@/components/public/mobile-bottom-nav';
import { getYouTubeEmbedUrl, isDirectVideoUrl, markdownToHtml } from '@/lib/markdown';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

// Generate dynamic SEO metadata (OpenGraph, Twitter, Meta Tags)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const rows = await db.query`
    SELECT title, slug, excerpt, cover_image_url, meta_title, meta_description, meta_keywords, published_at
    FROM public.posts
    WHERE slug = ${params.slug} AND deleted_at IS NULL AND is_published = true
    LIMIT 1
  `;

  if (rows.length === 0) {
    return {
      title: 'Artikel Tidak Ditemukan - MTQ XIX Tambusai Utara',
    };
  }

  const post = rows[0];
  const pageTitle = post.meta_title || `${post.title} - MTQ XIX Tambusai Utara`;
  const pageDesc = post.meta_description || post.excerpt;
  const pageImage = post.cover_image_url || '/api/cdn/posts/jadwal-mtq-xix.jpg';

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: post.meta_keywords || 'mtq xix, tambusai utara, mahato, tilawatil quran, lptq',
    authors: [{ name: 'LPTQ Tambusai Utara' }],
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      type: 'article',
      publishedTime: post.published_at,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [pageImage],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const rows = await db.query`
    SELECT 
      id, title, slug, category, excerpt, content, cover_image_url, 
      gallery_images, video_url, meta_title, meta_description, meta_keywords, content_format,
      author_name, published_at, created_at, updated_at
    FROM public.posts
    WHERE slug = ${params.slug} AND deleted_at IS NULL AND is_published = true
    LIMIT 1
  `;

  if (rows.length === 0) {
    notFound();
  }

  const post = rows[0];

  const youtubeEmbed = getYouTubeEmbedUrl(post.video_url);
  const isVideo = isDirectVideoUrl(post.video_url);
  const gallery = Array.isArray(post.gallery_images) ? post.gallery_images : [];

  // Parse Markdown or pass HTML
  const renderedContent =
    post.content_format === 'html'
      ? post.content
      : markdownToHtml(post.content);

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url ? [post.cover_image_url] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Person',
      name: post.author_name || 'Sekretariat LPTQ',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LPTQ Kecamatan Tambusai Utara',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lptk-mahato.vercel.app/api/cdn/logos/lptq-logo.png',
      },
    },
  };

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-amber-200">
      {/* Injected Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/berita"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Semua Warta & Pengumuman</span>
          </Link>
        </div>

        {/* Article Container: Crisp rectangular card with rounded-md */}
        <article className="space-y-6 bg-white border border-neutral-300 rounded-md p-6 sm:p-8 shadow-xs">
          {/* Header Metadata */}
          <div className="space-y-3 pb-6 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">۞</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-semibold bg-emerald-100 border border-emerald-300 rounded-sm text-emerald-800">
                <Tag className="w-3 h-3 text-emerald-700" />
                {post.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 font-mono">
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
            <div className="aspect-[16/9] w-full bg-neutral-100 rounded-md overflow-hidden border border-neutral-300">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Video Player (YouTube or Direct Video) */}
          {(youtubeEmbed || isVideo) && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 font-mono uppercase tracking-wide">
                <PlayCircle className="w-4 h-4 text-rose-600" />
                <span>Video Terkait</span>
              </div>
              {youtubeEmbed ? (
                <div className="aspect-video w-full rounded-md overflow-hidden border border-neutral-300 bg-black shadow-xs">
                  <iframe
                    src={youtubeEmbed}
                    title={post.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-md overflow-hidden border border-neutral-300 bg-black shadow-xs">
                  <video src={post.video_url} controls className="w-full h-full" />
                </div>
              )}
            </div>
          )}

          {/* Lead Paragraph / Excerpt */}
          <div className="text-sm sm:text-base font-semibold text-emerald-950 leading-relaxed border-l-4 border-emerald-700 bg-stone-50 p-4 rounded-r-md border border-stone-200 shadow-xs">
            {post.excerpt}
          </div>

          {/* Main Article Body (Rendered Markdown/HTML) */}
          <div
            className="prose max-w-none text-xs sm:text-sm text-neutral-800 leading-relaxed pt-2 space-y-3"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />

          {/* Photo Gallery (Up to 5 images) */}
          {gallery.length > 0 && (
            <div className="pt-6 border-t border-neutral-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 font-mono uppercase tracking-wide">
                <Images className="w-4 h-4 text-emerald-700" />
                <span>Galeri Foto ({gallery.length} Dokumentasi)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((imgUrl: string, idx: number) => (
                  <a
                    key={idx}
                    href={imgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-[4/3] rounded-md overflow-hidden border border-neutral-300 bg-neutral-100 shadow-xs block"
                  >
                    <img
                      src={imgUrl}
                      alt={`Dokumentasi ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      Lihat Foto Penuh
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <Link
              href="/berita"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs sm:text-sm font-semibold rounded-md border border-neutral-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Semua Warta & Pengumuman</span>
            </Link>

            <a
              href="/documents/juknis-mtq-xix-tambusai-utara-2026.pdf"
              download="juknis-mtq-xix-tambusai-utara-2026.pdf"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Juknis Resmi</span>
            </a>
          </div>
        </article>
      </main>

      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}
