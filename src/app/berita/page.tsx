import React from 'react';
import Link from 'next/link';
import { db } from '@/server/db/client';
import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';
import { MobileBottomNav } from '@/components/public/mobile-bottom-nav';
import { Calendar, User, Tag, ArrowRight, ArrowLeft, Search, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: {
    kategori?: string;
    q?: string;
  };
}

export default async function BeritaIndexPage({ searchParams }: PageProps) {
  const selectedCategory = searchParams?.kategori || '';
  const searchQuery = searchParams?.q || '';

  let query = `
    SELECT 
      id, title, slug, category, excerpt, cover_image_url, 
      author_name, published_at
    FROM public.posts
    WHERE deleted_at IS NULL AND is_published = true
  `;
  const params: any[] = [];

  if (selectedCategory && selectedCategory !== 'Semua') {
    params.push(selectedCategory);
    query += ` AND category = $${params.length}`;
  }

  if (searchQuery) {
    params.push(`%${searchQuery}%`);
    query += ` AND (title ILIKE $${params.length} OR excerpt ILIKE $${params.length})`;
  }

  query += ` ORDER BY published_at DESC LIMIT 50`;

  const articles = await db.raw(query, params);

  // Available categories
  const categories = ['Semua', 'Pengumuman', 'Juknis', 'Kafilah', 'Berita', 'Cabang'];

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-amber-200">
      <PublicHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-[11px] font-mono text-neutral-500">
            {articles.length} Warta Tersedia
          </span>
        </div>

        {/* Header Section: Rectangular with rounded-md */}
        <div className="bg-white border border-neutral-300 rounded-md p-6 sm:p-7 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-500 text-xs">۞</span>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-800">
              Warta & Informasi Resmi
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Berita & Pengumuman MTQ XIX Tambusai Utara
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
            Ikuti informasi terkini, agenda resmi, juknis musabaqah, dan hasil verifikasi kafilah desa se-Kecamatan Tambusai Utara.
          </p>

          {/* Search & Category Filter Form */}
          <form method="GET" action="/berita" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Cari judul warta atau pengumuman..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-md transition-colors min-h-[42px] flex items-center justify-center gap-2"
              >
                <span>Cari</span>
              </button>
            </div>

            {/* Category Filter Pills: Rectangular with rounded-md */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((cat) => {
                const isActive = (!selectedCategory && cat === 'Semua') || selectedCategory === cat;
                return (
                  <Link
                    key={cat}
                    href={cat === 'Semua' ? '/berita' : `/berita?kategori=${encodeURIComponent(cat)}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                    }`}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          </form>
        </div>

        {/* News Grid: Rectangular Cards */}
        {articles.length === 0 ? (
          <div className="bg-white border border-neutral-300 rounded-md p-12 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-800">Tidak ada warta yang ditemukan</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Coba gunakan kata kunci lain atau pilih kategori warta yang berbeda.
            </p>
            <div className="pt-2">
              <Link
                href="/berita"
                className="inline-flex px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-md transition-colors"
              >
                Reset Filter
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((item: any) => (
              <article
                key={item.id}
                className="bg-white border border-neutral-300 rounded-md overflow-hidden shadow-xs hover:border-emerald-600 transition-all flex flex-col group"
              >
                {/* Cover Image */}
                {item.cover_image_url && (
                  <div className="aspect-[16/9] w-full bg-neutral-100 overflow-hidden relative border-b border-neutral-200">
                    <img
                      src={item.cover_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-mono font-semibold bg-white/95 backdrop-blur-xs border border-neutral-200 rounded-sm text-emerald-900 shadow-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {!item.cover_image_url && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 rounded-sm border border-emerald-200">
                        {item.category}
                      </span>
                    )}

                    <h2 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/berita/${item.slug}`}>{item.title}</Link>
                    </h2>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        <span>
                          {new Date(item.published_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                    </div>

                    <Link
                      href={`/berita/${item.slug}`}
                      className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold transition-colors"
                    >
                      <span>Baca</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}
