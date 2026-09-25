'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Save,
  Upload,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingItem {
  key: string;
  value: any;
  description: string;
  updated_at?: string;
  updated_by_name?: string;
}

interface CdnAsset {
  key: string;
  name: string;
  type: string;
  size_bytes: number;
  last_modified?: string;
  url: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // CDN Media state
  const [cdnAssets, setCdnAssets] = useState<CdnAsset[]>([]);
  const [loadingCdn, setLoadingCdn] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);
  const [uploadingGeneral, setUploadingGeneral] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);
  const generalFileInputRef = useRef<HTMLInputElement>(null);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSettings(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCdnAssets = async () => {
    setLoadingCdn(true);
    try {
      const res = await fetch('/api/admin/cdn');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.assets)) {
          setCdnAssets(json.data.assets);
        }
      }
    } catch (err) {
      console.error('Failed to load CDN assets:', err);
    } finally {
      setLoadingCdn(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadCdnAssets();
  }, []);

  const handleValueChange = (key: string, value: any) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  // Upload a specific file to Neon Object Storage CDN
  const handleUploadToCdn = async (
    file: File,
    folder: string,
    targetSettingKey?: string
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/admin/cdn/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage({
          text: json.error?.message || 'Gagal mengunggah berkas ke CDN.',
          type: 'error',
        });
        return null;
      }

      const cdnUrl = json.data.url;

      if (targetSettingKey) {
        handleValueChange(targetSettingKey, cdnUrl);
      }

      setMessage({
        text: `Berkas berhasil diunggah ke Neon CDN: ${json.data.file_name}`,
        type: 'success',
      });

      // Refresh CDN list
      loadCdnAssets();
      return cdnUrl;
    } catch {
      setMessage({
        text: 'Terjadi kendala jaringan saat mengunggah ke CDN.',
        type: 'error',
      });
      return null;
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setMessage(null);
    try {
      await handleUploadToCdn(file, 'cdn/logos', 'app_logo_url');
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const handleStampFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingStamp(true);
    setMessage(null);
    try {
      await handleUploadToCdn(file, 'cdn/logos', 'app_stamp_url');
    } finally {
      setUploadingStamp(false);
      if (stampFileInputRef.current) stampFileInputRef.current.value = '';
    }
  };

  const handleGeneralFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGeneral(true);
    setMessage(null);
    try {
      await handleUploadToCdn(file, 'cdn/uploads');
    } finally {
      setUploadingGeneral(false);
      if (generalFileInputRef.current) generalFileInputRef.current.value = '';
    }
  };

  const handleDeleteCdnAsset = async (key: string) => {
    if (!confirm(`Hapus berkas "${key}" dari Neon Storage CDN?`)) return;

    try {
      const res = await fetch(`/api/admin/cdn?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessage({ text: 'Berkas berhasil dihapus dari CDN.', type: 'success' });
        loadCdnAssets();
      } else {
        setMessage({
          text: json.error?.message || 'Gagal menghapus berkas dari CDN.',
          type: 'error',
        });
      }
    } catch {
      setMessage({ text: 'Terjadi kendala jaringan.', type: 'error' });
    }
  };

  const handleCopyUrl = (url: string, key: string) => {
    const fullUrl = url.startsWith('http')
      ? url
      : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = settings.map((s) => ({
      key: s.key,
      value: s.value,
    }));

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({
          text: 'Pengaturan sistem berhasil disimpan.',
          type: 'success',
        });
      } else {
        setMessage({
          text: json.error?.message || 'Gagal menyimpan pengaturan.',
          type: 'error',
        });
      }
    } catch {
      setMessage({ text: 'Terjadi kendala jaringan.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-neutral-900">Pengaturan Sistem</h1>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 text-xs rounded border ${
            message.type === 'success'
              ? 'bg-neutral-50 border-neutral-800 text-black font-medium'
              : 'bg-neutral-100 border-neutral-400 text-black'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Memuat konfigurasi...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form: Settings (2 Kolom) */}
          <div className="lg:col-span-2 space-y-4">
            <form
              onSubmit={handleSave}
              className="bg-white border border-neutral-300 rounded-lg p-5 sm:p-6 space-y-4 shadow-sm"
            >
              <div className="border-b border-neutral-200 pb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider">
                  Variabel Konfigurasi Sistem
                </h2>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {settings.length} Pengaturan Aktif
                </span>
              </div>

              {settings.map((item) => (
                <div
                  key={item.key}
                  className="space-y-1.5 pb-3.5 border-b border-neutral-100 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-black font-mono">
                      {item.key}
                    </label>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    {item.description}
                  </p>

                  {/* Field Khusus: app_logo_url */}
                  {item.key === 'app_logo_url' ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.value || ''}
                          onChange={(e) => handleValueChange(item.key, e.target.value)}
                          placeholder="Masukkan URL CDN atau path logo (/api/cdn/... atau https://...)"
                          className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono placeholder:text-neutral-400"
                        />
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          isLoading={uploadingLogo}
                          onClick={() => logoFileInputRef.current?.click()}
                          className="gap-1.5 text-xs font-bold shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Unggah
                        </Button>
                      </div>

                      {/* Preview Box */}
                      {item.value && (
                        <div className="flex items-center gap-3 p-2.5 bg-neutral-50 border border-neutral-200 rounded">
                          <div className="w-12 h-12 bg-white p-1 rounded border border-neutral-300 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={item.value}
                              alt="Logo"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="text-[11px] min-w-0 flex-1">
                            <div className="font-bold text-black">Pratinjau Logo Aktif</div>
                            <div className="text-neutral-500 font-mono text-[10px] truncate">
                              {item.value}
                            </div>
                            <div className="text-[9px] text-neutral-400 mt-0.5">
                              Logo akan otomatis diterapkan pada Sidebar, Login, Kop Juknis, dan Kartu Peserta.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : item.key === 'app_stamp_url' ? (
                    /* Field Khusus: app_stamp_url */
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.value || ''}
                          onChange={(e) => handleValueChange(item.key, e.target.value)}
                          placeholder="Masukkan URL CDN atau path stempel (/api/cdn/... atau https://...)"
                          className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono placeholder:text-neutral-400"
                        />
                        <input
                          ref={stampFileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleStampFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          isLoading={uploadingStamp}
                          onClick={() => stampFileInputRef.current?.click()}
                          className="gap-1.5 text-xs font-bold shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Unggah
                        </Button>
                      </div>

                      {/* Preview Box */}
                      {item.value && (
                        <div className="flex items-center gap-3 p-2.5 bg-neutral-50 border border-neutral-200 rounded">
                          <div className="w-12 h-12 bg-white p-1 rounded border border-neutral-300 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={item.value}
                              alt="Stempel"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="text-[11px] min-w-0 flex-1">
                            <div className="font-bold text-black">Pratinjau Stempel Aktif</div>
                            <div className="text-neutral-500 font-mono text-[10px] truncate">
                              {item.value}
                            </div>
                            <div className="text-[9px] text-neutral-400 mt-0.5">
                              Stempel akan otomatis diterapkan pada kolom pengesahan Kartu Peserta dan Juknis.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : typeof item.value === 'boolean' ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={(e) => handleValueChange(item.key, e.target.checked)}
                        className="rounded border-neutral-300 text-black focus:ring-black"
                      />
                      <span className="text-xs text-black">{item.value ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                  ) : Array.isArray(item.value) ? (
                    <input
                      type="text"
                      value={item.value.join(', ')}
                      onChange={(e) =>
                        handleValueChange(
                          item.key,
                          e.target.value.split(',').map((x) => x.trim())
                        )
                      }
                      className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
                    />
                  ) : (
                    <input
                      type="text"
                      value={item.value ?? ''}
                      onChange={(e) => handleValueChange(item.key, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-3">
                <Button type="submit" size="sm" isLoading={saving} className="gap-1.5 font-bold">
                  <Save className="w-3.5 h-3.5" />
                  Simpan
                </Button>
              </div>
            </form>
          </div>

          {/* CDN Media Storage Panel (Neon S3 Storage) (1 Kolom) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-neutral-300 rounded-lg p-5 space-y-4 shadow-sm">
              <div className="border-b border-neutral-200 pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-black uppercase tracking-wider">
                    Neon CDN Storage
                  </h2>
                  <p className="text-[10px] text-neutral-500">
                    Penyimpanan objek S3 Neon berkecepatan tinggi
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadCdnAssets}
                  isLoading={loadingCdn}
                  className="p-1.5 h-7 w-7"
                  title="Muat Ulang"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>

              {/* Upload Dropzone / Trigger */}
              <div className="space-y-2">
                <input
                  ref={generalFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
                  onChange={handleGeneralFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={uploadingGeneral}
                  onClick={() => generalFileInputRef.current?.click()}
                  className="w-full gap-1.5 font-bold text-xs border-dashed border-2 py-3"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Unggah Media ke CDN
                </Button>
                <p className="text-[9px] text-neutral-400 text-center">
                  PNG, JPG, WEBP, SVG, PDF (Maks. 5 MB)
                </p>
              </div>

              {/* Asset List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {cdnAssets.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-400 bg-neutral-50 rounded border border-neutral-200">
                    Belum ada media di CDN.
                  </div>
                ) : (
                  cdnAssets.map((asset) => (
                    <div
                      key={asset.key}
                      className="p-2 border border-neutral-200 rounded-md bg-neutral-50 flex items-center justify-between gap-2 hover:border-neutral-400 transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-10 h-10 bg-white border border-neutral-300 rounded flex items-center justify-center shrink-0 overflow-hidden">
                        {asset.type.startsWith('image/') ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-[10px]">
                        <div className="font-bold text-black truncate">{asset.name}</div>
                        <div className="text-neutral-500 font-mono text-[9px]">
                          {formatFileSize(asset.size_bytes)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(asset.url, asset.key)}
                          className="p-1 hover:bg-neutral-200 rounded text-neutral-700 transition-colors"
                          title="Salin URL CDN"
                        >
                          {copiedKey === asset.key ? (
                            <Check className="w-3.5 h-3.5 text-black font-bold" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleValueChange('app_logo_url', asset.url)}
                          className="p-1 hover:bg-neutral-200 rounded text-neutral-700 transition-colors text-[9px] font-bold"
                          title="Gunakan sebagai Logo"
                        >
                          Logo
                        </button>

                        {!asset.key.includes('default') && !asset.key.endsWith('lptq-logo.png') && !asset.key.endsWith('lptq-stempel.png') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCdnAsset(asset.key)}
                            className="p-1 hover:bg-neutral-200 rounded text-neutral-500 hover:text-black transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
