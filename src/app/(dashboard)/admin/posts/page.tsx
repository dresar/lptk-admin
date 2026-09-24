'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Newspaper, Eye, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PaginationBar } from '@/components/ui/pagination';
import { ViewToggle, useViewMode } from '@/components/ui/view-toggle';
import { BulkToolbar } from '@/components/ui/bulk-toolbar';
import { PaginationMeta } from '@/types/api';

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content?: string;
  cover_image_url?: string | null;
  author_name: string;
  is_published: boolean;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export default function PostsPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useViewMode('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Post | null>(null);
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
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const qParam = search ? `&q=${encodeURIComponent(search)}` : '';
      const catParam = categoryFilter ? `&category=${encodeURIComponent(categoryFilter)}` : '';
      const res = await fetch(`/api/admin/posts?page=${page}&page_size=12${qParam}${catParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setMeta(json.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Berita',
      excerpt: '',
      content: '',
      cover_image_url: '/api/cdn/cdn/posts/jadwal-mtq-xix.jpg',
      author_name: 'Sekretariat LPTQ',
      is_published: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (item: Post) => {
    setEditingItem(item);
    setFormError(null);
    try {
      // Fetch full content if not present
      const res = await fetch(`/api/admin/posts/${item.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const p = json.data;
          setFormData({
            title: p.title,
            slug: p.slug,
            category: p.category,
            excerpt: p.excerpt,
            content: p.content || '',
            cover_image_url: p.cover_image_url || '',
            author_name: p.author_name || 'Sekretariat LPTQ',
            is_published: p.is_published,
          });
          setIsModalOpen(true);
          return;
        }
      }
    } catch {}
    setFormData({
      title: item.title,
      slug: item.slug,
      category: item.category,
      excerpt: item.excerpt,
      content: item.content || '',
      cover_image_url: item.cover_image_url || '',
      author_name: item.author_name,
      is_published: item.is_published,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);

    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'cdn/posts');

    try {
      const res = await fetch('/api/admin/cdn/upload', {
        method: 'POST',
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error?.message || 'Gagal mengunggah gambar ke CDN.');
        return;
      }
      setFormData((prev) => ({ ...prev, cover_image_url: json.data.url }));
    } catch {
      setFormError('Kendala jaringan saat mengunggah gambar.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const isEdit = !!editingItem;
    const url = isEdit ? `/api/admin/posts/${editingItem.id}` : '/api/admin/posts';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setFormError(json.error?.message || 'Gagal menyimpan artikel.');
        setFormSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      fetchPosts();
    } catch {
      setFormError('Terjadi kendala jaringan.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: Post) => {
    try {
      const res = await fetch(`/api/admin/posts/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !item.is_published }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus artikel ini?')) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Gagal menghapus artikel.');
        return;
      }
      fetchPosts();
    } catch {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.length} artikel terpilih?`)) return;
    setBulkLoading(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      }
      setSelectedIds([]);
      fetchPosts();
    } catch {
      alert('Gagal melakukan hapus massal.');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Berita & Informasi</h1>
          <p className="text-xs text-neutral-500">Kelola artikel publik, pengumuman jadwal, dan juknis MTQ XIX</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari berita atau pengumuman..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
        >
          <option value="">Semua Kategori</option>
          <option value="Pengumuman">Pengumuman</option>
          <option value="Juknis">Juknis</option>
          <option value="Kafilah">Kafilah</option>
          <option value="Berita">Berita</option>
          <option value="Cabang">Cabang</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Memuat daftar berita...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Belum ada artikel berita ditemukan.
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="w-10 px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.length === items.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="rounded border-neutral-300"
                    />
                  </th>
                  <th className="px-4 py-2.5">Judul</th>
                  <th className="px-4 py-2.5">Kategori</th>
                  <th className="px-4 py-2.5">Penulis</th>
                  <th className="px-4 py-2.5">Tanggal</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="w-28 px-4 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded border-neutral-300"
                      />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-black max-w-xs">
                      <div className="truncate font-semibold">{item.title}</div>
                      <div className="text-[11px] font-mono text-neutral-500 truncate">/{item.slug}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{item.author_name}</td>
                    <td className="px-4 py-2.5 text-neutral-500 font-mono text-[11px]">
                      {new Date(item.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          item.is_published
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }`}
                      >
                        {item.is_published ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            Terbit
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-neutral-500" />
                            Draf
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        className="min-h-[44px] min-w-[44px] p-2 inline-flex items-center justify-center"
                        aria-label="Ubah"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="min-h-[44px] min-w-[44px] p-2 inline-flex items-center justify-center"
                        aria-label="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar meta={meta} onPageChange={setPage} />
        </div>
      ) : (
        /* Grid Mode */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-neutral-200 rounded overflow-hidden hover:border-black transition-colors flex flex-col justify-between"
              >
                <div>
                  {item.cover_image_url && (
                    <div className="h-36 w-full bg-neutral-100 border-b border-neutral-200 overflow-hidden relative">
                      <img
                        src={item.cover_image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-black text-white rounded">
                        {item.category}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                      <span>{item.author_name}</span>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded border-neutral-300"
                      />
                    </div>
                    <h3 className="font-bold text-sm text-black line-clamp-2 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      item.is_published
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                    }`}
                  >
                    {item.is_published ? 'Terbit' : 'Draf'}
                  </button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      className="min-h-[44px] min-w-[44px] p-2 inline-flex items-center justify-center"
                      aria-label="Ubah"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="min-h-[44px] min-w-[44px] p-2 inline-flex items-center justify-center"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-white border border-neutral-200 rounded">
            <PaginationBar meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Bulk Delete Toolbar */}
      <BulkToolbar
        selectedCount={selectedIds.length}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds([])}
        isLoading={bulkLoading}
      />

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Ubah Berita' : 'Tambah Berita'}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto px-0.5">
          {formError && (
            <div className="p-2 text-xs bg-neutral-100 border border-neutral-300 rounded text-black">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Judul Artikel</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  title,
                  slug: editingItem ? prev.slug : generateSlug(title),
                }));
              }}
              placeholder="Judul pengumuman atau berita resmi"
              className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Slug URL</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                placeholder="slug-url-artikel"
                className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
              >
                <option value="Pengumuman">Pengumuman</option>
                <option value="Juknis">Juknis</option>
                <option value="Kafilah">Kafilah</option>
                <option value="Berita">Berita</option>
                <option value="Cabang">Cabang</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Foto Sampul (CDN)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                placeholder="/api/cdn/cdn/posts/nama-gambar.jpg"
                className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white font-mono"
              />
              <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-black rounded cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Unggah...' : 'Pilih'}</span>
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
              <div className="mt-2 h-24 w-full bg-neutral-100 rounded border border-neutral-200 overflow-hidden">
                <img
                  src={formData.cover_image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Ringkasan (Excerpt)</label>
            <textarea
              required
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Ringkasan singkat berita untuk kartu publik"
              className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Konten Lengkap</label>
            <textarea
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Tuliskan isi berita, pengumuman, atau petunjuk teknis selengkapnya..."
              className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">Nama Penulis</label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-medium text-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded border-neutral-300"
                />
                Terbitkan ke Publik
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={formSubmitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
