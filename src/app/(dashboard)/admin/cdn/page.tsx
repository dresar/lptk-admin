'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Search,
  Copy,
  Check,
  Trash2,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CdnAsset {
  key: string;
  name: string;
  folder: string;
  type: string;
  size_bytes: number;
  last_modified?: string;
  url: string;
}

export default function AdminCdnPage() {
  const [assets, setAssets] = useState<CdnAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [selectedFolderUpload, setSelectedFolderUpload] = useState<string>('uploads');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Lightbox Modal state
  const [previewAsset, setPreviewAsset] = useState<CdnAsset | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [previewUsage, setPreviewUsage] = useState<{ is_used: boolean; usages: string[] } | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = useState<CdnAsset | null>(null);
  const [deleteUsage, setDeleteUsage] = useState<{ is_used: boolean; usages: string[] } | null>(null);
  const [checkingDeleteUsage, setCheckingDeleteUsage] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss top-right toast after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cdn');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.assets)) {
          // Sort newest first
          const sorted = [...json.data.assets].sort((a, b) => {
            const timeA = a.last_modified ? new Date(a.last_modified).getTime() : 0;
            const timeB = b.last_modified ? new Date(b.last_modified).getTime() : 0;
            return timeB - timeA;
          });
          setAssets(sorted);
        }
      } else {
        setMessage({ text: 'Gagal memuat daftar aset CDN.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Kendala jaringan saat memuat CDN.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', selectedFolderUpload);

    try {
      const res = await fetch('/api/admin/cdn/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage({
          text: json.error?.message || 'Gagal mengunggah berkas.',
          type: 'error',
        });
        return;
      }

      setMessage({
        text: `Berhasil diunggah: ${json.data.file_name}`,
        type: 'success',
      });
      loadAssets();
    } catch {
      setMessage({ text: 'Kendala jaringan saat mengunggah ke CDN.', type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = async (url: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const fullUrl = `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedKey(key);
      setMessage({ text: 'Tautan CDN berhasil disalin.', type: 'success' });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setMessage({ text: 'Gagal menyalin tautan.', type: 'error' });
    }
  };

  // Open Preview Modal & fetch usage
  const handleOpenPreview = async (asset: CdnAsset) => {
    setPreviewAsset(asset);
    setZoomLevel(1);
    setPreviewUsage(null);
    setLoadingUsage(true);

    try {
      const res = await fetch(`/api/admin/cdn/usage?key=${encodeURIComponent(asset.key)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setPreviewUsage(json.data);
        }
      }
    } catch {
    } finally {
      setLoadingUsage(false);
    }
  };

  // Open Delete Confirmation Modal & fetch usage
  const handleOpenDelete = async (asset: CdnAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTarget(asset);
    setDeleteUsage(null);
    setCheckingDeleteUsage(true);

    try {
      const res = await fetch(`/api/admin/cdn/usage?key=${encodeURIComponent(asset.key)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDeleteUsage(json.data);
        }
      }
    } catch {
    } finally {
      setCheckingDeleteUsage(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cdn?key=${encodeURIComponent(deleteTarget.key)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage({ text: json.error?.message || 'Gagal menghapus berkas.', type: 'error' });
        return;
      }
      setMessage({ text: 'Berkas berhasil dihapus.', type: 'success' });
      setDeleteTarget(null);
      if (previewAsset?.key === deleteTarget.key) {
        setPreviewAsset(null);
      }
      loadAssets();
    } catch {
      setMessage({ text: 'Kendala jaringan saat menghapus berkas.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  // Mouse wheel zoom handler for preview
  const handleWheelZoom = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredAssets = assets.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.key.toLowerCase().includes(search.toLowerCase());
    
    let matchFolder = true;
    if (activeFolder === 'posts') {
      matchFolder = item.folder === 'posts' || item.key.includes('posts/');
    } else if (activeFolder === 'profil') {
      matchFolder = item.folder === 'profil' || item.folder === 'users' || item.key.includes('profil/') || item.key.includes('users/');
    } else if (activeFolder === 'juknis') {
      matchFolder = item.folder === 'juknis' || item.key.includes('juknis/');
    } else if (activeFolder === 'branding') {
      matchFolder = item.folder === 'logos' || item.folder === 'hero' || item.key.includes('logos/') || item.key.includes('hero/');
    } else if (activeFolder === 'uploads') {
      matchFolder = item.folder === 'uploads' || item.folder === 'root';
    }

    return matchSearch && matchFolder;
  });

  const totalBytes = assets.reduce((sum, item) => sum + (item.size_bytes || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top-Right Notification Toast */}
      {message && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`p-3 text-xs rounded-md border shadow-lg flex items-center gap-2.5 max-w-sm ${
              message.type === 'success'
                ? 'bg-neutral-900 text-white border-neutral-800'
                : 'bg-red-950 text-white border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="flex-1 font-medium">{message.text}</span>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="text-neutral-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Media CDN</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <select
            value={selectedFolderUpload}
            onChange={(e) => setSelectedFolderUpload(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-neutral-300 rounded-md bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="posts">Kategori: Berita</option>
            <option value="profil">Kategori: Profil</option>
            <option value="juknis">Kategori: Juknis</option>
            <option value="logos">Kategori: Branding (Logo)</option>
            <option value="hero">Kategori: Branding (Hero)</option>
            <option value="uploads">Kategori: Umum (Uploads)</option>
          </select>
          <Button
            size="sm"
            isLoading={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 font-bold"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Unggah
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAssets}
            disabled={loading}
            title="Muat Ulang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Storage Status & Quota Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white border border-neutral-300 rounded-md">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block font-semibold">
            Status Penyimpanan
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-neutral-900">Neon S3 & CDN GitHub Aktif</span>
          </div>
        </div>
        <div className="p-3 bg-white border border-neutral-300 rounded-md">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block font-semibold">
            Total Berkas
          </span>
          <div className="text-sm font-bold text-neutral-900 mt-0.5">
            {assets.length} Berkas
          </div>
        </div>
        <div className="p-3 bg-white border border-neutral-300 rounded-md">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block font-semibold">
            Kapasitas Digunakan
          </span>
          <div className="text-sm font-bold text-neutral-900 mt-0.5">
            {formatFileSize(totalBytes)}
          </div>
        </div>
      </div>

      {/* Search & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'posts', label: 'Berita' },
            { id: 'profil', label: 'Profil' },
            { id: 'juknis', label: 'Juknis' },
            { id: 'branding', label: 'Branding' },
            { id: 'uploads', label: 'Umum' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFolder(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeFolder === tab.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berkas..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-neutral-300 rounded-md">
          Memuat aset CDN...
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-neutral-300 rounded-md">
          Belum ada berkas CDN ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredAssets.map((asset) => {
            const isImage = asset.type.startsWith('image/');

            return (
              <div
                key={asset.key}
                onClick={() => handleOpenPreview(asset)}
                className="bg-white border border-neutral-300 rounded-md p-2.5 flex flex-col justify-between hover:border-black cursor-pointer transition-colors shadow-xs group"
              >
                {/* Visual Thumbnail */}
                <div className="w-full aspect-square bg-neutral-50 rounded-sm border border-neutral-200 flex items-center justify-center overflow-hidden relative">
                  {isImage ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-150"
                      loading="lazy"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-neutral-400" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>

                {/* Metadata */}
                <div className="mt-2 space-y-1 min-w-0">
                  <div className="font-bold text-xs text-neutral-900 truncate" title={asset.name}>
                    {asset.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>{formatFileSize(asset.size_bytes)}</span>
                    <span className="uppercase px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded-sm font-semibold">
                      {asset.folder}
                    </span>
                  </div>
                </div>

                {/* Only Salin and Hapus actions */}
                <div className="mt-2.5 pt-2 border-t border-neutral-200 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleCopyUrl(asset.url, asset.key, e)}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold rounded-sm flex items-center gap-1 transition-colors"
                    title="Salin Tautan"
                  >
                    {copiedKey === asset.key ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOpenDelete(asset, e)}
                    className="p-1 text-neutral-400 hover:text-red-700 transition-colors rounded-sm hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Detail Modal with Zoom */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="bg-white rounded-md max-w-2xl w-full p-4 sm:p-5 border border-neutral-300 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="min-w-0 pr-4">
                <h2 className="text-sm font-bold text-neutral-900 truncate">{previewAsset.name}</h2>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500 font-mono">
                  <span>{formatFileSize(previewAsset.size_bytes)}</span>
                  <span>•</span>
                  <span className="uppercase">{previewAsset.folder}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview with Zoom Controls */}
            {previewAsset.type.startsWith('image/') ? (
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                {/* Zoom Controls Bar */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                      className="p-1 border border-neutral-300 rounded hover:bg-neutral-100 text-neutral-700"
                      title="Perkecil (-)"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] w-12 text-center text-neutral-600">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 4))}
                      className="p-1 border border-neutral-300 rounded hover:bg-neutral-100 text-neutral-700"
                      title="Perbesar (+)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-100 text-[11px] font-mono text-neutral-700"
                      title="Reset Ukuran Normal"
                    >
                      <RotateCcw className="w-3 h-3 inline mr-1" /> 100%
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Gunakan scroll mouse untuk zoom
                  </span>
                </div>

                {/* Viewport Box */}
                <div
                  onWheel={handleWheelZoom}
                  className="w-full h-72 sm:h-96 bg-neutral-100 rounded border border-neutral-300 overflow-auto flex items-center justify-center p-4 relative cursor-zoom-in"
                >
                  <img
                    src={previewAsset.url}
                    alt={previewAsset.name}
                    style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.1s ease-out' }}
                    className="max-w-full max-h-full object-contain select-none"
                  />
                </div>
              </div>
            ) : (
              <div className="h-48 bg-neutral-100 rounded border border-neutral-300 flex flex-col items-center justify-center space-y-2">
                <FileText className="w-12 h-12 text-neutral-400" />
                <span className="text-xs text-neutral-500 font-mono">{previewAsset.type}</span>
              </div>
            )}

            {/* Usage Status info */}
            <div className="p-3 rounded-md border border-neutral-200 bg-neutral-50 text-xs">
              <span className="font-bold text-neutral-800 block mb-1">Status Penggunaan di Sistem:</span>
              {loadingUsage ? (
                <span className="text-neutral-500 font-mono text-[11px]">Memeriksa keterkaitan berkas...</span>
              ) : previewUsage && previewUsage.usages.length > 0 ? (
                <div className="space-y-1">
                  <span className="inline-block px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold font-mono">
                    Sedang Digunakan ({previewUsage.usages.length} Lokasi)
                  </span>
                  <ul className="list-disc pl-4 text-neutral-700 text-[11px] space-y-0.5 pt-0.5">
                    {previewUsage.usages.map((u, idx) => (
                      <li key={idx}>{u}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <span className="text-neutral-500 text-[11px]">Berkas ini belum digunakan di halaman manapun.</span>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyUrl(previewAsset.url, previewAsset.key)}
                className="gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleOpenDelete(previewAsset)}
                  className="gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewAsset(null)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Usage Warning */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-md max-w-md w-full p-5 space-y-4 border border-neutral-300 shadow-xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-sm font-bold text-neutral-900">Konfirmasi Hapus Berkas</h2>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-neutral-700">
                Apakah Anda yakin ingin menghapus berkas <strong className="text-black">{deleteTarget.name}</strong> dari CDN?
              </p>

              {checkingDeleteUsage ? (
                <div className="p-2.5 bg-neutral-100 rounded text-neutral-500 font-mono text-[11px]">
                  Memeriksa keterkaitan berkas di database...
                </div>
              ) : deleteUsage && deleteUsage.usages.length > 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Peringatan: Berkas ini sedang aktif digunakan pada:</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] text-amber-950 font-medium">
                    {deleteUsage.usages.map((u, idx) => (
                      <li key={idx}>{u}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-800 pt-1">
                    Jika dihapus, tampilan di halaman tersebut akan kembali ke standar bawaan atau kosong.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded text-neutral-600 text-[11px]">
                  Berkas ini belum digunakan pada halaman manapun. Aman untuk dihapus.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={executeDelete}
                isLoading={deleting}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
