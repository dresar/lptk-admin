'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, Newspaper, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: { id: string };
}

export default function EditPostPage({ params }: PageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Berita',
    excerpt: '',
    content: '',
    cover_image_url: '',
    author_name: 'Sekretariat LPTQ',
    is_published: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/admin/posts/${params.id}`);
        if (!res.ok) throw new Error('Gagal memuat artikel.');
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setFormData({
            title: p.title || '',
            slug: p.slug || '',
            category: p.category || 'Berita',
            excerpt: p.excerpt || '',
            content: p.content || '',
            cover_image_url: p.cover_image_url || '',
            author_name: p.author_name || 'Sekretariat LPTQ',
            is_published: !!p.is_published,
          });
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal mengambil data artikel.');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [params.id]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg(null);

    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'posts');

    try {
      const res = await fetch('/api/admin/cdn/upload', {
        method: 'POST',
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Gagal mengunggah foto ke CDN.');
        return;
      }
      setFormData((prev) => ({ ...prev, cover_image_url: json.data.url }));
    } catch {
      setErrorMsg('Kendala jaringan saat mengunggah gambar.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Gagal memperbarui artikel.');
        setSubmitting(false);
        return;
      }

      router.push('/admin/posts');
      router.refresh();
    } catch {
      setErrorMsg('Terjadi kendala jaringan.');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    try {
      const res = await fetch(`/api/admin/posts/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/posts');
        router.refresh();
      }
    } catch {
      alert('Gagal menghapus artikel.');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded-2xl">
        Memuat data artikel...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-emerald-600" />
              <span>Ubah Artikel Berita</span>
            </h1>
            <p className="text-xs text-neutral-500">
              Perbarui judul, isi warta, foto sampul, atau status publikasi artikel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {formData.slug && (
            <a
              href={`/berita/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-black border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Publik</span>
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
            title="Hapus Artikel"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Button
            type="submit"
            form="edit-post-form"
            size="sm"
            isLoading={submitting}
            className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Main Form */}
      <form id="edit-post-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 uppercase font-mono">
              Judul Artikel *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 uppercase font-mono">
                Slug URL *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 uppercase font-mono">
                Kategori Berita *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black"
              >
                <option value="Pengumuman">Pengumuman</option>
                <option value="Juknis">Juknis</option>
                <option value="Kafilah">Kafilah</option>
                <option value="Berita">Berita</option>
                <option value="Cabang">Cabang</option>
              </select>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-800 uppercase font-mono">
              Foto Sampul Artikel (CDN)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                placeholder="/api/cdn/posts/nama-gambar.jpg"
                className="flex-1 px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white font-mono"
              />
              <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-black rounded-xl cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-neutral-600" />
                <span>{uploadingImage ? 'Mengunggah...' : 'Ganti Foto'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {formData.cover_image_url && (
              <div className="mt-3 aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-neutral-200 relative bg-neutral-100 shadow-xs">
                <img
                  src={formData.cover_image_url}
                  alt="Pratinjau Sampul"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 uppercase font-mono">
              Ringkasan Singkat (Excerpt) *
            </label>
            <textarea
              required
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white leading-relaxed"
            />
          </div>

          {/* Content */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 uppercase font-mono">
              Konten Lengkap Berita *
            </label>
            <textarea
              required
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 text-xs sm:text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white font-sans leading-relaxed"
            />
          </div>

          {/* Author & Publishing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100 items-center">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 uppercase font-mono">
                Nama Penulis / Instansi
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
              />
            </div>

            <div className="flex items-center sm:pt-5">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-neutral-900 cursor-pointer p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors w-full">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded border-neutral-300 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Terbitkan langsung ke Portal Publik</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/posts"
            className="px-5 py-2.5 text-xs font-semibold text-neutral-600 hover:text-black border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            Batal
          </Link>
          <Button
            type="submit"
            isLoading={submitting}
            className="px-6 py-2.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
