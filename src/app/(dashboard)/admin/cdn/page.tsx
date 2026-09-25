'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Search,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  FileText,
  RefreshCw,
  Folder,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
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
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cdn');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.assets)) {
          setAssets(json.data.assets);
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
        text: `Berkas berhasil diunggah: ${json.data.file_name}`,
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

  const handleCopyUrl = async (url: string, key: string) => {
    try {
      const fullUrl = `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setMessage({ text: 'Gagal menyalin tautan.', type: 'error' });
    }
  };

  const handleSetLogo = async (url: string) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [{ key: 'app_logo_url', value: url }],
        }),
      });
      if (res.ok) {
        setMessage({ text: 'Logo resmi berhasil diperbarui.', type: 'success' });
      } else {
        setMessage({ text: 'Gagal memperbarui logo.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Kendala jaringan saat memperbarui logo.', type: 'error' });
    }
  };

  const handleSetStamp = async (url: string) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [{ key: 'app_stamp_url', value: url }],
        }),
      });
      if (res.ok) {
        setMessage({ text: 'Stempel resmi berhasil diperbarui.', type: 'success' });
      } else {
        setMessage({ text: 'Gagal memperbarui stempel.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Kendala jaringan saat memperbarui stempel.', type: 'error' });
    }
  };

  const handleDelete = async (key: string) => {
    try {
      const res = await fetch(`/api/admin/cdn?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage({ text: json.error?.message || 'Gagal menghapus berkas.', type: 'error' });
        return;
      }
      setMessage({ text: 'Berkas berhasil dihapus.', type: 'success' });
      setDeleteConfirmKey(null);
      loadAssets();
    } catch {
      setMessage({ text: 'Kendala jaringan saat menghapus berkas.', type: 'error' });
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
    const matchFolder =
      activeFolder === 'all' ||
      item.folder.toLowerCase() === activeFolder.toLowerCase() ||
      item.key.toLowerCase().includes(activeFolder.toLowerCase());
    return matchSearch && matchFolder;
  });

  const totalBytes = assets.reduce((sum, item) => sum + (item.size_bytes || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Manajemen CDN</h1>
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
            className="text-xs px-2.5 py-1.5 border border-neutral-300 rounded-md bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="uploads">Folder: Uploads</option>
            <option value="logos">Folder: Logos</option>
            <option value="hero">Folder: Hero</option>
            <option value="posts">Folder: Berita</option>
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

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-3 text-xs rounded-md border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-neutral-500 hover:text-neutral-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Storage Status & Quota Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white border border-neutral-200 rounded-md">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block font-semibold">
            Status Penyimpanan
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-neutral-900">Neon S3 & CDN GitHub Aktif</span>
          </div>
        </div>
        <div className="p-3 bg-white border border-neutral-200 rounded-md">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block font-semibold">
            Total Berkas
          </span>
          <div className="text-sm font-bold text-neutral-900 mt-0.5">
            {assets.length} Berkas
          </div>
        </div>
        <div className="p-3 bg-white border border-neutral-200 rounded-md">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block font-semibold">
            Kapasitas Digunakan
          </span>
          <div className="text-sm font-bold text-neutral-900 mt-0.5">
            {formatFileSize(totalBytes)}
          </div>
        </div>
      </div>

      {/* Search & Folder Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'logos', label: 'Logos' },
            { id: 'hero', label: 'Hero' },
            { id: 'posts', label: 'Berita' },
            { id: 'uploads', label: 'Uploads' },
          ].map((tab) => (
            <button
              key={tab.id}
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
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded-md">
          Memuat aset CDN...
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded-md">
          Belum ada berkas CDN ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredAssets.map((asset) => {
            const isImage = asset.type.startsWith('image/');
            const isProtected =
              asset.key.endsWith('lptq-logo.png') || asset.key.endsWith('lptq-stempel.png');

            return (
              <div
                key={asset.key}
                className="bg-white border border-neutral-200 rounded-md p-2.5 flex flex-col justify-between hover:border-neutral-400 transition-colors shadow-xs"
              >
                {/* Visual Thumbnail */}
                <div className="w-full aspect-square bg-neutral-50 rounded-sm border border-neutral-200 flex items-center justify-center overflow-hidden relative group">
                  {isImage ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-neutral-400" />
                  )}

                  {/* Hover Overlay Link */}
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                    title="Buka Berkas Asli"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Metadata */}
                <div className="mt-2 space-y-1 min-w-0">
                  <div className="font-bold text-xs text-neutral-900 truncate" title={asset.name}>
                    {asset.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>{formatFileSize(asset.size_bytes)}</span>
                    <span className="uppercase px-1 py-0.2 bg-neutral-100 rounded-sm font-semibold">
                      {asset.folder}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset.url, asset.key)}
                      className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold rounded-sm flex items-center gap-1 transition-colors"
                      title="Salin Tautan"
                    >
                      {copiedKey === asset.key ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Salin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>

                    {isImage && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSetLogo(asset.url)}
                          className="px-1.5 py-1 hover:bg-neutral-100 text-neutral-700 text-[10px] font-semibold rounded-sm border border-neutral-200"
                          title="Gunakan sebagai Logo Aplikasi"
                        >
                          Logo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStamp(asset.url)}
                          className="px-1.5 py-1 hover:bg-neutral-100 text-neutral-700 text-[10px] font-semibold rounded-sm border border-neutral-200"
                          title="Gunakan sebagai Stempel LPTK"
                        >
                          Stempel
                        </button>
                      </>
                    )}
                  </div>

                  {!isProtected && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmKey(asset.key)}
                      className="p-1 text-neutral-400 hover:text-red-700 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmKey && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-md max-w-sm w-full p-4 space-y-3 border border-neutral-200 shadow-md">
            <h2 className="text-sm font-bold text-neutral-900">Hapus Berkas</h2>
            <p className="text-xs text-neutral-600">
              Hapus berkas ini dari CDN? Tindakan tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmKey(null)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(deleteConfirmKey)}
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
