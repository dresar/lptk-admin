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
    <section id="berita" className="bg-white text-black py-14 border-b border-neutral-200 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-mono bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
            <Newspaper className="w-3.5 h-3.5 text-black" />
            Informasi Terkini
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
            Warta & Pengumuman MTQ XIX 2026
          </h2>
          <p className="text-xs text-neutral-600">
            Informasi resmi jadwal musabaqah, petunjuk teknis pendaftaran, dan kabar kafilah
          </p>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded">
            Memuat warta terbaru...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded">
            Belum ada warta terbit.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:border-black transition-colors flex flex-col justify-between"
              >
                <div>
                  {post.cover_image_url && (
                    <div className="aspect-[16/10] bg-neutral-100 overflow-hidden relative border-b border-neutral-200">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-mono font-semibold bg-black text-white rounded">
                        {post.category}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-600 font-mono">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>
                        {new Date(post.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-black leading-snug line-clamp-2">
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
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-200 rounded transition-colors min-h-[44px]"
                  >
                    <span>Baca</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-none"
            onClick={() => setReadingPost(null)}
          >
            <div
              className="bg-white text-black w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-neutral-300 p-6 space-y-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-neutral-100 border border-neutral-300 rounded font-mono">
                  {readingPost.category}
                </span>

                <button
                  type="button"
                  onClick={() => setReadingPost(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-700 hover:text-black hover:bg-neutral-100 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {readingPost.cover_image_url && (
                <div className="aspect-[16/9] w-full bg-neutral-100 rounded overflow-hidden border border-neutral-200">
                  <img
                    src={readingPost.cover_image_url}
                    alt={readingPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-black leading-snug">
                  {readingPost.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-neutral-600 font-mono">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    {readingPost.author_name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    {new Date(readingPost.published_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="text-xs text-neutral-800 leading-relaxed whitespace-pre-line border-t border-neutral-100 pt-4">
                {readingPost.content || readingPost.excerpt}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                <Link
                  href={`/berita/${readingPost.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 hover:text-black min-h-[44px] py-2 focus:outline-none focus:underline"
                >
                  <span>Buka Halaman Lengkap</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  type="button"
                  onClick={() => setReadingPost(null)}
                  className="px-4 py-2 text-xs font-semibold bg-black text-white hover:bg-neutral-800 rounded min-h-[44px]"
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
