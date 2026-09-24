'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, ArrowRight, ExternalLink } from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  cover_image_url?: string | null;
  author_name: string;
  published_at: string;
}

export function NewsSection() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch 4 main news articles as requested by user
    fetch('/api/public/posts?limit=4')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) {
          setPosts(json.data.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="berita" className="bg-white text-neutral-900 py-12 sm:py-16 border-b border-stone-200 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="max-w-xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800">
              <span className="text-amber-500 font-bold">۞</span>
              <Newspaper className="w-3.5 h-3.5 text-emerald-700" />
              <span>Warta & Informasi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Warta & Pengumuman MTQ XIX 2026
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Informasi jadwal musabaqah dan pengumuman resmi panitia pelaksana Desa Mahato.
            </p>
          </div>

          <div>
            <Link
              href="/berita"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-emerald-900 text-xs font-semibold rounded-xl border border-stone-300 transition-colors shadow-xs"
            >
              <span>Lihat Semua Berita</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Main News Grid */}
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500 bg-stone-50 border border-stone-200 rounded-2xl">
            Memuat 4 warta utama...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500 bg-stone-50 border border-stone-200 rounded-2xl">
            Belum ada warta terbit.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {post.cover_image_url && (
                    <div className="aspect-[16/10] bg-stone-100 overflow-hidden relative border-b border-stone-200">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-white/95 text-emerald-900 rounded border border-stone-200 shadow-xs">
                          {post.category}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    {!post.cover_image_url && (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                        {post.category}
                      </span>
                    )}

                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/berita/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>
                        {new Date(post.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </span>

                    <Link
                      href={`/berita/${post.slug}`}
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
      </div>
    </section>
  );
}
