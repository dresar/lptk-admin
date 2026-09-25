'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Upload,
  Eye,
  Code,
  FileText,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Youtube,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Post } from '@/types/database';
import {
  getYouTubeEmbedUrl,
  isDirectVideoUrl,
  markdownToHtml,
  calculateSeoAudit,
} from '@/lib/markdown';

export interface PostEditorProps {
  initialData?: Post | null;
  isEdit?: boolean;
}

export function PostEditor({ initialData, isEdit = false }: PostEditorProps) {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    category: initialData?.category || 'Berita',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    cover_image_url: initialData?.cover_image_url || '/api/cdn/posts/jadwal-mtq-xix.jpg',
    gallery_images: initialData?.gallery_images || [],
    video_url: initialData?.video_url || '',
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    meta_keywords: initialData?.meta_keywords || '',
    content_format: (initialData?.content_format as 'markdown' | 'html') || 'markdown',
    author_name: initialData?.author_name || 'Sekretariat LPTQ',
    is_published: initialData?.is_published ?? true,
  });

  const [editorTab, setEditorTab] = useState<'write' | 'html' | 'preview'>('write');
  const [htmlContent, setHtmlContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync HTML view when switching to HTML tab
  useEffect(() => {
    if (editorTab === 'html' || editorTab === 'preview') {
      setHtmlContent(markdownToHtml(formData.content));
    }
  }, [formData.content, editorTab]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // SEO Calculation
  const seoAudit = useMemo(() => {
    return calculateSeoAudit({
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      meta_keywords: formData.meta_keywords,
      cover_image_url: formData.cover_image_url,
    });
  }, [
    formData.title,
    formData.slug,
    formData.excerpt,
    formData.content,
    formData.meta_title,
    formData.meta_description,
    formData.meta_keywords,
    formData.cover_image_url,
  ]);

  // Insert markdown shortcuts into textarea at cursor position
  const insertText = (prefix: string, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || placeholder;

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
    setFormData((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // Upload cover image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setErrorMsg(null);

    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'posts');

    try {
      const res = await fetch('/api/admin/cdn/upload', { method: 'POST', body });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Gagal mengunggah foto.');
        return;
      }
      setFormData((prev) => ({ ...prev, cover_image_url: json.data.url }));
    } catch {
      setErrorMsg('Kendala jaringan saat mengunggah foto.');
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload gallery image (max 5)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.gallery_images.length >= 5) {
      setErrorMsg('Maksimal 5 foto galeri.');
      return;
    }

    setUploadingGallery(true);
    setErrorMsg(null);

    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'posts');

    try {
      const res = await fetch('/api/admin/cdn/upload', { method: 'POST', body });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Gagal mengunggah foto galeri.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, json.data.url].slice(0, 5),
      }));
    } catch {
      setErrorMsg('Kendala jaringan saat mengunggah foto.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    if (formData.gallery_images.length >= 5) {
      setErrorMsg('Maksimal 5 foto galeri.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      gallery_images: [...prev.gallery_images, newGalleryUrl.trim()].slice(0, 5),
    }));
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const url = isEdit ? `/api/admin/posts/${initialData?.id}` : '/api/admin/posts';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Gagal menyimpan artikel.');
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

  const youtubeEmbed = getYouTubeEmbedUrl(formData.video_url);

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-16">
      {/* Top Header - Minimalist, single line, 2-word title */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/posts"
            className="p-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100 text-neutral-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
            {isEdit ? 'Edit Berita' : 'Tambah Berita'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isEdit && formData.slug && (
            <a
              href={`/berita/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-black border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Publik</span>
            </a>
          )}
          <Link
            href="/admin/posts"
            className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-black border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Batal
          </Link>
          <Button
            type="submit"
            form="post-form"
            size="sm"
            isLoading={submitting}
            className="gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-xs px-4 py-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan</span>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-xs font-semibold text-rose-800 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Core Content (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Title & Slug */}
            <div className="bg-white border border-neutral-200 rounded-md p-4 sm:p-5 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Judul Berita *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title,
                      slug: isEdit ? prev.slug : generateSlug(title),
                    }));
                  }}
                  placeholder="Judul artikel atau pengumuman..."
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 text-neutral-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1 font-mono">
                    Slug URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    placeholder="slug-artikel"
                    className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 text-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 text-neutral-900 font-medium"
                  >
                    <option value="Berita">Berita</option>
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Juknis">Juknis</option>
                    <option value="Kafilah">Kafilah</option>
                    <option value="Cabang">Cabang</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Ringkasan Singkat (Excerpt) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu berita..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 text-neutral-900 bg-white"
                />
              </div>
            </div>

            {/* Rich Content Editor with Toolbar & HTML View */}
            <div className="bg-white border border-neutral-200 rounded-md shadow-xs overflow-hidden">
              {/* Editor Tabs & Toolbar Header */}
              <div className="bg-neutral-50 border-b border-neutral-200 p-2 sm:px-4 flex flex-wrap items-center justify-between gap-2">
                {/* View Tabs */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditorTab('write')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                      editorTab === 'write'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tulis (MD)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('html')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                      editorTab === 'html'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Kode HTML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('preview')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                      editorTab === 'preview'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau</span>
                  </button>
                </div>

                {/* Toolbar Tools (when in Write Mode) */}
                {editorTab === 'write' && (
                  <div className="flex items-center gap-0.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => insertText('**', '**', 'teks tebal')}
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Tebal (Bold)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('*', '*', 'teks miring')}
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Miring (Italic)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-4 bg-neutral-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertText('## ', '\n', 'Subjudul')}
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Subjudul H2"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('### ', '\n', 'Sub-bagian')}
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Subjudul H3"
                    >
                      <Heading3 className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-4 bg-neutral-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertText('> ', '\n', 'Kutipan pernyataan')}
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Kutipan (Quote)"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('- ', '\n', 'Poin daftar')}
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Daftar Poin"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('1. ', '\n', 'Poin terurut')}
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Daftar Angka"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-4 bg-neutral-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertText('[', '](https://...)', 'Judul Tautan')}
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Sisipkan Tautan"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('![', '](/api/cdn/posts/...jpg)', 'Keterangan Gambar')}
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Sisipkan Gambar"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertText(
                          '\n| Kolom 1 | Kolom 2 |\n|---|---|\n| Data 1 | Data 2 |\n'
                        )
                      }
                      className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-sm"
                      title="Sisipkan Tabel"
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Editor Workspace */}
              <div className="p-4">
                {editorTab === 'write' && (
                  <textarea
                    ref={textareaRef}
                    required
                    rows={12}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Tuliskan isi berita dalam format Markdown atau teks biasa..."
                    className="w-full text-xs sm:text-sm font-sans focus:outline-none text-neutral-900 bg-white leading-relaxed resize-y min-h-[280px]"
                  />
                )}

                {editorTab === 'html' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pb-1 border-b border-neutral-100">
                      <span>Kode sumber HTML hasil kompilasi:</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(htmlContent);
                          alert('HTML disalin ke clipboard!');
                        }}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        Salin HTML
                      </button>
                    </div>
                    <textarea
                      rows={12}
                      value={htmlContent}
                      readOnly
                      className="w-full text-xs font-mono bg-stone-50 border border-neutral-200 rounded-md p-3 text-neutral-800 focus:outline-none resize-y min-h-[280px]"
                    />
                  </div>
                )}

                {editorTab === 'preview' && (
                  <div className="min-h-[280px] p-2 sm:p-4 bg-stone-50 rounded-md border border-neutral-200">
                    <div
                      className="prose max-w-none text-neutral-900"
                      dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-neutral-400 italic">Konten masih kosong.</p>' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Media Section: Galeri Foto (Maks. 5 Foto) & Video YouTube */}
            <div className="bg-white border border-neutral-200 rounded-md p-4 sm:p-5 shadow-xs space-y-5">
              {/* 1. Galeri Foto */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Galeri Foto ({formData.gallery_images.length}/5 Foto)</span>
                  </label>
                  <span className="text-[11px] text-neutral-500">Maks. 5 Foto</span>
                </div>

                {/* Upload & Add Bar */}
                {formData.gallery_images.length < 5 && (
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <input
                      type="text"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="/api/cdn/posts/... atau URL gambar..."
                      className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleAddGalleryUrl}
                        variant="outline"
                        size="sm"
                        disabled={!newGalleryUrl.trim()}
                        className="text-xs rounded-md"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Tambah
                      </Button>
                      <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-md cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingGallery ? 'Mengunggah...' : 'Unggah CDN'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGalleryUpload}
                          className="hidden"
                          disabled={uploadingGallery || formData.gallery_images.length >= 5}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Gallery Grid */}
                {formData.gallery_images.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic py-2">
                    Belum ada foto tambahan di galeri (maksimal 5 foto).
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                    {formData.gallery_images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-md overflow-hidden border border-neutral-300 bg-neutral-100 shadow-xs"
                      >
                        <img src={url} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-rose-700 text-white p-1 rounded-sm transition-colors"
                          title="Hapus foto ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded-sm font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Video & YouTube Support */}
              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <label className="block text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-rose-600" />
                  <span>Tautan Video / YouTube</span>
                </label>
                <input
                  type="text"
                  value={formData.video_url || ''}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                />

                {/* Video Preview */}
                {youtubeEmbed && (
                  <div className="mt-2 aspect-video max-w-md rounded-md overflow-hidden border border-neutral-300 bg-black">
                    <iframe
                      src={youtubeEmbed}
                      title="Pratinjau Video YouTube"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: SEO Audit & Metadata (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Foto Sampul Utama */}
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-xs space-y-3">
              <label className="block text-xs font-semibold text-neutral-800">
                Foto Sampul Utama *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  placeholder="/api/cdn/posts/...jpg"
                  className="flex-1 px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 text-neutral-900 font-mono"
                />
                <label className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-black rounded-md cursor-pointer transition-colors flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingCover ? '...' : 'Unggah'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={uploadingCover}
                  />
                </label>
              </div>

              {formData.cover_image_url && (
                <div className="aspect-[16/9] rounded-md overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img
                    src={formData.cover_image_url}
                    alt="Sampul"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Publikasi & Penulis */}
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-xs space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Nama Penulis
                </label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 text-neutral-900"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded-sm border-neutral-300 text-emerald-800 focus:ring-emerald-700"
                />
                <span>Terbitkan langsung ke Publik</span>
              </label>
            </div>

            {/* SEO AUDIT & METADATA PANEL */}
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <Search className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Audit SEO</span>
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold ${
                    seoAudit.score >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : seoAudit.score >= 55
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Skor: {seoAudit.score}/100 ({seoAudit.grade})
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    seoAudit.score >= 80
                      ? 'bg-emerald-600'
                      : seoAudit.score >= 55
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${seoAudit.score}%` }}
                />
              </div>

              {/* Google SERP Snippet Preview */}
              <div className="bg-stone-50 border border-neutral-200 rounded-md p-3 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 block">
                  Pratinjau Hasil Pencarian Google
                </span>
                <div className="text-[11px] text-neutral-500 truncate font-mono">
                  lptk-mahato.vercel.app › berita › {formData.slug || 'slug-berita'}
                </div>
                <div className="text-xs font-bold text-blue-800 truncate hover:underline cursor-pointer">
                  {formData.meta_title || formData.title || 'Judul Berita MTQ XIX'}
                </div>
                <div className="text-[11px] text-neutral-600 line-clamp-2 leading-tight">
                  {formData.meta_description || formData.excerpt || 'Ringkasan cuplikan berita di hasil pencarian.'}
                </div>
              </div>

              {/* SEO Inputs */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-neutral-700">
                      Meta Title (Optimal: 40-70 Karakter)
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {(formData.meta_title || '').length}/70
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.meta_title || ''}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder={formData.title || 'Judul khusus mesin pencari...'}
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 text-neutral-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-neutral-700">
                      Meta Deskripsi (Optimal: 80-160 Karakter)
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {(formData.meta_description || '').length}/160
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.meta_description || ''}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder={formData.excerpt || 'Deskripsi khusus mesin pencari...'}
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Kata Kunci (Keywords, Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords || ''}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    placeholder="mtq, mahato, tilawah, tambusai utara"
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 text-neutral-900"
                  />
                </div>
              </div>

              {/* SEO Checklist */}
              <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                <span className="text-[11px] font-bold text-neutral-700 block">
                  Daftar Periksa SEO:
                </span>
                {seoAudit.checks.map((check) => (
                  <div key={check.id} className="flex items-start gap-1.5 text-[11px]">
                    {check.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : check.severity === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={check.passed ? 'text-neutral-700' : 'text-neutral-500'}>
                      {check.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
