'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Save,
  Upload,
  ExternalLink,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WebsiteSettingsPage() {
  const [formData, setFormData] = useState({
    website_hero_title: '',
    website_hero_subtitle: '',
    website_hero_image_url: '',
    website_hero_image_caption: '',
    website_countdown_target: '',
    website_announcement: '',
    website_host_village: '',
    website_contact_phone: '',
    website_contact_address: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/website/settings');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setFormData({
              website_hero_title: json.data.website_hero_title || '',
              website_hero_subtitle: json.data.website_hero_subtitle || '',
              website_hero_image_url: json.data.website_hero_image_url || '',
              website_hero_image_caption: json.data.website_hero_image_caption || '',
              website_countdown_target: json.data.website_countdown_target || '2026-11-09T08:00:00+07:00',
              website_announcement: json.data.website_announcement || '',
              website_host_village: json.data.website_host_village || 'Desa Mahato',
              website_contact_phone: json.data.website_contact_phone || '',
              website_contact_address: json.data.website_contact_address || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load website settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'hero');

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
      setFormData((prev) => ({ ...prev, website_hero_image_url: json.data.url }));
      setSuccessMsg('Foto panggung berhasil diunggah ke CDN.');
    } catch {
      setErrorMsg('Kendala jaringan saat mengunggah foto.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/website/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Gagal menyimpan pengaturan website.');
        return;
      }

      setSuccessMsg('Pengaturan website publik berhasil disimpan dan diperbarui seketika!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setErrorMsg('Kendala jaringan saat menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded-2xl">
        Memuat konfigurasi website...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <span>Kustomisasi Website & Hero</span>
          </h1>
          <p className="text-xs text-neutral-500">
            Atur foto panggung arena MTQ, target countdown, judul utama, dan informasi publik
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:text-black border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <span>Lihat Portal Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Button
            type="submit"
            form="website-settings-form"
            size="sm"
            isLoading={saving}
            className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 rounded-xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form id="website-settings-form" onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Hero Section Customization */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wider">
              1. Hero Section & Gambar Panggung
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1 font-mono uppercase">
              Judul Utama Hero (Headline)
            </label>
            <input
              type="text"
              required
              value={formData.website_hero_title}
              onChange={(e) => setFormData({ ...formData, website_hero_title: e.target.value })}
              placeholder="Musabaqah Tilawatil Qur'an XIX Tingkat Kecamatan Tambusai Utara"
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1 font-mono uppercase">
              Sub-Judul Hero (Deskripsi Ringkas)
            </label>
            <textarea
              rows={2}
              required
              value={formData.website_hero_subtitle}
              onChange={(e) => setFormData({ ...formData, website_hero_subtitle: e.target.value })}
              placeholder="Pusat informasi resmi dan portal verifikasi data peserta MTQ XIX Tahun 2026. Diikuti oleh 11 kafilah desa se-Kecamatan Tambusai Utara."
              className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white leading-relaxed"
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Tips: Maksimal 1–2 kalimat padat dan informatif.
            </p>
          </div>

          {/* Right Hero Image Card */}
          <div className="space-y-3 pt-3 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-800 font-mono uppercase">
              Foto Panggung Arena Utama (Sebelah Kanan Hero)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.website_hero_image_url}
                onChange={(e) => setFormData({ ...formData, website_hero_image_url: e.target.value })}
                placeholder="/api/cdn/hero/mtq-hero-mahato.jpg"
                className="flex-1 px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white font-mono"
              />
              <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-black rounded-xl cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-neutral-600" />
                <span>{uploadingImage ? 'Mengunggah...' : 'Unggah ke CDN'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {formData.website_hero_image_url && (
              <div className="mt-2 aspect-[16/10] max-w-sm rounded-xl overflow-hidden border border-neutral-200 relative bg-neutral-100 shadow-xs">
                <img
                  src={formData.website_hero_image_url}
                  alt="Pratinjau Panggung Hero"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">
                  Pratinjau Foto CDN
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 font-mono uppercase">
                Teks Keterangan Foto Panggung (Caption)
              </label>
              <input
                type="text"
                value={formData.website_hero_image_caption}
                onChange={(e) => setFormData({ ...formData, website_hero_image_caption: e.target.value })}
                placeholder="Mimbar Utama Musabaqah - Desa Mahato 2026"
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Countdown & Announcement */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wider">
              2. Countdown Waktu & Pengumuman
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 font-mono uppercase">
                Waktu Target Pembukaan MTQ (Countdown)
              </label>
              <input
                type="text"
                required
                value={formData.website_countdown_target}
                onChange={(e) => setFormData({ ...formData, website_countdown_target: e.target.value })}
                placeholder="2026-11-09T08:00:00+07:00"
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white font-mono"
              />
              <p className="mt-1 text-[11px] text-neutral-500">
                Format: YYYY-MM-DDTHH:mm:ss+07:00 (contoh: 2026-11-09T08:00:00+07:00)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 font-mono uppercase">
                Tuan Rumah Musabaqah
              </label>
              <input
                type="text"
                required
                value={formData.website_host_village}
                onChange={(e) => setFormData({ ...formData, website_host_village: e.target.value })}
                placeholder="Desa Mahato"
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1 font-mono uppercase">
              Teks Pengumuman Singkat (Banner / Marquee)
            </label>
            <input
              type="text"
              value={formData.website_announcement}
              onChange={(e) => setFormData({ ...formData, website_announcement: e.target.value })}
              placeholder="Pemberkasan fisik Map Biru diserahkan di Kantor KUA Rantau Kasai selambatnya 20 Oktober 2026."
              className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
            />
          </div>
        </div>

        {/* Section 3: Secretariat & Contact */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wider">
              3. Alamat Sekretariat & Kontak
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1 font-mono uppercase">
              Alamat Sekretariat KUA
            </label>
            <input
              type="text"
              value={formData.website_contact_address}
              onChange={(e) => setFormData({ ...formData, website_contact_address: e.target.value })}
              placeholder="Kantor KUA, Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara"
              className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1 font-mono uppercase">
              Nomor Telepon Panitia
            </label>
            <input
              type="text"
              value={formData.website_contact_phone}
              onChange={(e) => setFormData({ ...formData, website_contact_phone: e.target.value })}
              placeholder="0812-6845-1120 / 0813-7123-9988"
              className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-black bg-white font-mono"
            />
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            isLoading={saving}
            className="px-6 py-2.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
          >
            Simpan Konfigurasi Website
          </Button>
        </div>
      </form>
    </div>
  );
}
