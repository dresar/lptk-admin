'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Post } from '@/types/database';
import { PostEditor } from '@/components/admin/post-editor';

interface PageProps {
  params: { id: string };
}

export default function EditPostPage({ params }: PageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/admin/posts/${params.id}`);
        if (!res.ok) throw new Error('Artikel tidak ditemukan.');
        const json = await res.json();
        if (json.success && json.data) {
          setPost(json.data);
        } else {
          throw new Error(json.error?.message || 'Gagal memuat artikel.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Kendala jaringan saat memuat artikel.');
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded-md">
        Memuat data artikel...
      </div>
    );
  }

  if (errorMsg || !post) {
    return (
      <div className="p-8 text-center space-y-3 bg-white border border-neutral-200 rounded-md max-w-lg mx-auto mt-6">
        <p className="text-xs font-semibold text-rose-600">{errorMsg || 'Artikel tidak ditemukan.'}</p>
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Berita</span>
        </Link>
      </div>
    );
  }

  return <PostEditor initialData={post} isEdit={true} />;
}
