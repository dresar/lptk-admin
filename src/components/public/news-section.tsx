'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, User, ArrowRight, X, ExternalLink } from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content?: string;
  cover_image_url?: string | null;
  author_name: string;
  published_at: string;
}

export function NewsSection() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingPost, setReadingPost] = useState<PostItem | null>(null);

  useEffect(() => {
    fetch('/api/public/posts?limit=6')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) {
          setPosts(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleOpenPost = async (post: PostItem) => {
    setReadingPost(post);
    // Fetch full post content
    try {
      const res = await fetch(`/api/public/posts/${post.slug}`);
      const json = await res.json();
      if (json?.data?.content) {
        setReadingPost(json.data);
      }
    } catch {}
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReadingPost(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section id="berita" className="bg-stone-50 text-neutral-900 py-16 border-b border-stone-200 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800">
            <span className="text-amber-600 font-bold">۞</span>
            <Newspaper className="w-3.5 h-3.5 text-emerald-700" />
            <span>Warta & Kabar Musabaqah</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Warta & Pengumuman MTQ XIX 2026
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Informasi resmi jadwal musabaqah, petunjuk teknis pendaftaran, dan kabar terbaru seputar kafilah
          </p>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-stone-200 rounded-2xl">
            Memuat warta terbaru...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-stone-200 rounded-2xl">
            Belum ada warta terbit.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white border-2 border-stone-200 rounded-2xl overflow-hidden hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group"
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
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-900 text-amber-300 border border-emerald-700 rounded-full shadow-xs">
                        {post.category}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {new Date(post.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => handleOpenPost(post)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-700 hover:text-white text-emerald-800 border border-emerald-200 rounded-xl transition-all min-h-[44px]"
                  >
                    <span>Baca Warta</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Article Reader Modal */}
        {readingPost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-xs"
            onClick={() => setReadingPost(null)}
          >
            <div
              className="bg-white text-neutral-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-emerald-600 p-6 sm:p-8 space-y-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">۞</span>
                  <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-mono">
                    {readingPost.category}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setReadingPost(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-stone-100 rounded-full focus:outline-none"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {readingPost.cover_image_url && (
                <div className="aspect-[16/9] w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
                  <img
                    src={readingPost.cover_image_url}
                    alt={readingPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                  {readingPost.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{readingPost.author_name}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {new Date(readingPost.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line border-t border-stone-100 pt-4">
                {readingPost.content || readingPost.excerpt}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-stone-200">
                <Link
                  href={`/berita/${readingPost.slug}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 min-h-[44px] py-2"
                >
                  <span>Buka Halaman Lengkap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setReadingPost(null)}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl min-h-[44px] transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
