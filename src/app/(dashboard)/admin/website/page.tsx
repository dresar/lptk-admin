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
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSlide, DEFAULT_HERO_SLIDES } from '@/types/website';

export default function WebsiteSettingsPage() {
  const [formData, setFormData] = useState({
    website_hero_title: '',
    website_hero_subtitle: '',
    website_countdown_target: '',
    website_announcement: '',
    website_host_village: '',
    website_contact_phone: '',
    website_contact_address: '',
  });

  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState<number | null>(null);
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
              website_countdown_target: json.data.website_countdown_target || '2026-11-09T08:00:00+07:00',
              website_announcement: json.data.website_announcement || '',
              website_host_village: json.data.website_host_village || 'Desa Mahato',
              website_contact_phone: json.data.website_contact_phone || '',
              website_contact_address: json.data.website_contact_address || '',
            });

            if (Array.isArray(json.data.website_hero_slides) && json.data.website_hero_slides.length > 0) {
              setSlides(json.data.website_hero_slides.slice(0, 5));
            }
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

  const handleSlideImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlideIndex(index);
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

      setSlides((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], image_url: json.data.url };
        return updated;
      });
      setSuccessMsg(`Foto slide ${index + 1} berhasil diunggah ke CDN.`);
    } catch {
      setErrorMsg('Kendala jaringan saat mengunggah foto.');
    } finally {
      setUploadingSlideIndex(null);
    }
  };

  const handleAddSlide = () => {
    if (slides.length >= 5) {
      setErrorMsg('Maksimal 5 slide banner hero.');
      return;
    }
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      image_url: '/api/cdn/hero/mtq-hero-mahato.jpg',
      title: 'Judul Banner Baru MTQ XIX',
      subtitle: 'Keterangan ringkas informasi kegiatan musabaqah di Desa Mahato.',
      info: '09 – 13 November 2026 • Mimbar Utama Desa Mahato',
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) {
      setErrorMsg('Minimal harus ada 1 slide banner hero.');
      return;
    }
    setSlides((prev) => prev.filter((_, i) => i !== index));
    if (activeSlideIndex >= index && activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setActiveSlideIndex(targetIndex);
  };

  const handleUpdateSlideField = (index: number, field: keyof HeroSlide, value: string) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        ...formData,
        website_hero_slides: slides.slice(0, 5),
      };

      const res = await fetch('/api/admin/website/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Gagal menyimpan pengaturan website.');
        return;
      }

      setSuccessMsg('Pengaturan website dan slider hero berhasil disimpan!');
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

  const currentSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Pengaturan Tampilan Website</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
              Live CMS
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Atur slider gambar latar hero (maks. 5 slide), judul, info kecil, dan hitung mundur pembukaan MTQ XIX
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold border border-neutral-300 transition-colors"
          >
            <span>Lihat Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: HERO SLIDER MANAGEMENT (MAX 5 SLIDES) */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Slider Hero Banner ({slides.length} / 5 Slide)</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Gambar slide latar belakang lebar dengan teks informasi di atasnya (auto-slide 5 detik, tanpa badge).
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSlide}
              disabled={slides.length >= 5}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Slide</span>
            </button>
          </div>

          {/* Slide Tabs Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {slides.map((s, idx) => (
              <button
                key={s.id || idx}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  activeSlideIndex === idx
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <span>Slide {idx + 1}</span>
                {slides.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSlide(idx);
                    }}
                    className="hover:text-rose-400 p-0.5"
                    title="Hapus Slide"
                  >
                    ×
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active Slide Form & Live Preview */}
          {currentSlide && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Form Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <span className="text-xs font-bold text-neutral-800">
                    Edit Konten Slide #{activeSlideIndex + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(activeSlideIndex, 'up')}
                      disabled={activeSlideIndex === 0}
                      className="p-1 text-neutral-500 hover:text-black disabled:opacity-30 border rounded"
                      title="Geser ke kiri/atas"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(activeSlideIndex, 'down')}
                      disabled={activeSlideIndex === slides.length - 1}
                      className="p-1 text-neutral-500 hover:text-black disabled:opacity-30 border rounded"
                      title="Geser ke kanan/bawah"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Image Upload & URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800">
                    Foto Latar Belakang Slide
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={currentSlide.image_url}
                      onChange={(e) => handleUpdateSlideField(activeSlideIndex, 'image_url', e.target.value)}
                      placeholder="/api/cdn/hero/nama-foto.jpg atau URL gambar..."
                      className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                    />
                    <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingSlideIndex === activeSlideIndex ? 'Mengunggah...' : 'Unggah CDN'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSlideImageUpload(activeSlideIndex, e)}
                        className="hidden"
                        disabled={uploadingSlideIndex !== null}
                      />
                    </label>
                  </div>
                </div>

                {/* Small Info Text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800">
                    Informasi Kecil (Jadwal & Lokasi — Teks Murni, Tanpa Badge)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.info}
                    onChange={(e) => handleUpdateSlideField(activeSlideIndex, 'info', e.target.value)}
                    placeholder="Contoh: 09 – 13 November 2026 • Mimbar Utama Desa Mahato"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800">
                    Judul Utama Slide
                  </label>
                  <input
                    type="text"
                    value={currentSlide.title}
                    onChange={(e) => handleUpdateSlideField(activeSlideIndex, 'title', e.target.value)}
                    placeholder="Judul banner hero..."
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-semibold"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-800">
                    Deskripsi Ringkas (Maksimal 1–2 Kalimat)
                  </label>
                  <textarea
                    rows={2}
                    value={currentSlide.subtitle}
                    onChange={(e) => handleUpdateSlideField(activeSlideIndex, 'subtitle', e.target.value)}
                    placeholder="Deskripsi singkat tentang kegiatan..."
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-2">
                <span className="block text-xs font-bold text-neutral-700">
                  Pratinjau Tampilan Slide #{activeSlideIndex + 1}
                </span>

                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-950 text-white border border-neutral-800 shadow-sm flex flex-col justify-end p-4">
                  <img
                    src={currentSlide.image_url}
                    alt={currentSlide.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/30 pointer-events-none" />

                  {/* Overlaid Text (No Badges) */}
                  <div className="relative z-10 space-y-1">
                    <div className="text-[10px] font-mono text-amber-300 font-medium">
                      {currentSlide.info || '09 – 13 November 2026 • Mimbar Utama'}
                    </div>
                    <div className="text-xs font-bold leading-tight line-clamp-2">
                      {currentSlide.title || 'Judul Slide Hero'}
                    </div>
                    <div className="text-[10px] text-neutral-300 line-clamp-2 leading-relaxed">
                      {currentSlide.subtitle || 'Keterangan ringkas kegiatan musabaqah.'}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500">
                  Banner akan otomatis berganti ke slide berikutnya setiap 5 detik di halaman publik.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: COUNTDOWN & EVENT INFO */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Target Waktu Hitung Mundur (Countdown Timer)</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Waktu pembukaan musabaqah yang dihitung mundur di banner hero.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800">
                Waktu Pelaksanaan (Format ISO / Tanggal)
              </label>
              <input
                type="text"
                value={formData.website_countdown_target}
                onChange={(e) => setFormData({ ...formData, website_countdown_target: e.target.value })}
                placeholder="2026-11-09T08:00:00+07:00"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
              />
              <span className="text-[11px] text-neutral-500">
                Default: 09 November 2026 pukul 08:00 WIB
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800">
                Desa Tuan Rumah
              </label>
              <input
                type="text"
                value={formData.website_host_village}
                onChange={(e) => setFormData({ ...formData, website_host_village: e.target.value })}
                placeholder="Desa Mahato"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SECRETARIAT & CONTACTS */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Kontak & Pengumuman Sekretariat</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Informasi kontak darurat panitia dan lokasi pengumpulan berkas fisik.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800">
                Nomor Telepon / WhatsApp Panitia
              </label>
              <input
                type="text"
                value={formData.website_contact_phone}
                onChange={(e) => setFormData({ ...formData, website_contact_phone: e.target.value })}
                placeholder="0812-6845-1120 / 0813-7123-9988"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800">
                Alamat Kantor Sekretariat
              </label>
              <input
                type="text"
                value={formData.website_contact_address}
                onChange={(e) => setFormData({ ...formData, website_contact_address: e.target.value })}
                placeholder="Kantor KUA, Jl. Raya Rantau Kasai..."
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs px-6 py-2.5 rounded-xl shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Semua Pengaturan'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
