'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  FileCode,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Code,
  File,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-context';
import { JUKNIS_OFFICIAL_HEADER } from '@/data/juknis-official-data';

interface JuknisSettings {
  juknis_mode: 'custom' | 'pdf' | 'word';
  juknis_letter_no: string;
  juknis_letter_date: string;
  event_official_name: string;
  event_dates: string;
  event_location: string;
  lptq_chairman: string;
  lptq_secretariat: string;
  submission_envelope: string;
  juknis_pdf_url: string;
  juknis_word_url: string;
  juknis_custom_html: string;
  app_logo_url: string;
  app_stamp_url: string;
}

const DEFAULT_SETTINGS: JuknisSettings = {
  juknis_mode: 'custom',
  juknis_letter_no: '09/LPTQ-T.U/MTQ/IX/2026',
  juknis_letter_date: '10 September 2026',
  event_official_name: 'Musabaqah Tilawatil Qur’an (MTQ) ke-XIX Tingkat Kecamatan Tambusai Utara Tahun 2026 di Desa Mahato',
  event_dates: '09 – 13 November 2026',
  event_location: 'Desa Mahato, Kecamatan Tambusai Utara, Kabupaten Rokan Hulu',
  lptq_chairman: 'Rahmat Saputra',
  lptq_secretariat: 'Kantor KUA - Jl. Raya Rantau Kasai Desa Rantau Kasai, Kec. Tambusai Utara, Kab. Rokan Hulu - Riau',
  submission_envelope: 'Map Warna Biru disampaikan di Sekretariat LPTQ Kecamatan / Bagian Administrasi MTQ Desa Mahato',
  juknis_pdf_url: '/documents/juknis-mtq-xix-tambusai-utara-2026.pdf',
  juknis_word_url: '',
  juknis_custom_html: '',
  app_logo_url: '/api/cdn/logos/lptq-logo.png',
  app_stamp_url: '/api/cdn/logos/lptq-stempel.png',
};

// Template HTML naskah dinas standar Times New Roman
const DEFAULT_HTML_TEMPLATE = `<!-- Naskah Dinas Resmi Juknis MTQ XIX (Times New Roman Standard) -->
<div class="font-tnr text-black p-8 sm:p-12 leading-relaxed bg-white">
  <!-- Kop Surat Resmi -->
  <div class="text-center pb-3">
    <h2 class="text-sm font-bold uppercase tracking-tight">LEMBAGA PENGEMBANGAN TILAWATIL QUR'AN (LPTQ)</h2>
    <h1 class="text-lg font-black uppercase tracking-tight mt-0.5">KECAMATAN TAMBUSAI UTARA</h1>
    <h3 class="text-xs font-bold uppercase mt-0.5">KABUPATEN ROKAN HULU - PROVINSI RIAU</h3>
    <p class="text-[11px] italic mt-1 text-neutral-700">Sekretariat: Kantor KUA - Jl. Raya Rantau Kasai, Desa Rantau Kasai, Kec. Tambusai Utara</p>
  </div>
  <div style="border-bottom: 3px double #000; margin-bottom: 20px;"></div>

  <!-- Atribut Surat -->
  <div class="grid grid-cols-12 gap-2 text-xs mb-6 font-tnr">
    <div class="col-span-8 space-y-1">
      <div><strong>Nomor</strong> : 09/LPTQ-T.U/MTQ/IX/2026</div>
      <div><strong>Lampiran</strong> : 1 (satu) Berkas Petunjuk Teknis</div>
      <div><strong>Perihal</strong> : Petunjuk Teknis MTQ ke-XIX Tahun 2026</div>
    </div>
    <div class="col-span-4 text-xs">
      <div>Kepada Yth:</div>
      <div>1. Kepala Desa se-Kec. Tambusai Utara</div>
      <div>2. Pengurus LPTK Desa se-Kec. Tambusai Utara</div>
      <div>di - Tempat</div>
    </div>
  </div>

  <!-- Isi Dokumen -->
  <div class="space-y-4 text-xs sm:text-sm text-justify font-tnr leading-relaxed">
    <p class="indent-8">
      Dalam rangka pelaksanaan Musabaqah Tilawatil Qur’an (MTQ) ke-XIX Tingkat Kecamatan Tambusai Utara Tahun 2026 yang diselenggarakan di Desa Mahato, dengan ini Lembaga Pengembangan Tilawatil Qur'an (LPTQ) Kecamatan Tambusai Utara menerbitkan Petunjuk Teknis Pelaksanaan sebagai pedoman resmi bagi seluruh kafilah desa.
    </p>

    <h4 class="font-bold uppercase text-center mt-6 text-sm">BAB I<br/>KETENTUAN UMUM</h4>
    <p>1. Waktu Pelaksanaan: 09 s/d 13 November 2026.</p>
    <p>2. Lokasi Kegiatan: Desa Mahato, Kecamatan Tambusai Utara, Kabupaten Rokan Hulu.</p>
    <p>3. Peserta adalah utusan resmi dari desa se-Kecamatan Tambusai Utara yang dibuktikan dengan Surat Mandat resmi Kepala Desa / LPTK Desa setempat.</p>

    <h4 class="font-bold uppercase text-center mt-6 text-sm">BAB II<br/>PERSYARATAN ADMINISTRASI (MAP BIRU)</h4>
    <p>Setiap peserta wajib melengkapi 6 dokumen fisik yang dimasukkan ke dalam <strong>Map Warna Biru</strong>:</p>
    <ol class="list-decimal pl-6 space-y-1">
      <li>Surat Mandat dari Kepala Desa atau LPTK Desa setempat.</li>
      <li>Surat Keterangan Berdomisili asli di Kecamatan Tambusai Utara.</li>
      <li>Fotokopi Ijazah formal terakhir yang telah dilegalisir.</li>
      <li>Fotokopi Akte Kelahiran untuk verifikasi batasan umur per 09 November 2026.</li>
      <li>Fotokopi Kartu Keluarga (KK) dengan NIK 16 digit yang sah.</li>
      <li>Surat Pernyataan Kebenaran Dokumen bermaterai Rp 10.000,-.</li>
    </ol>

    <h4 class="font-bold uppercase text-center mt-6 text-sm">BAB III<br/>PENUTUP</h4>
    <p class="indent-8">
      Demikian petunjuk teknis ini disampaikan untuk dipedomani sebagaimana mestinya oleh seluruh ofisial dan peserta musabaqah.
    </p>
  </div>

  <!-- Tanda Tangan & Stempel Resmi -->
  <div class="mt-12 flex justify-end font-tnr text-xs">
    <div class="w-64 text-center space-y-1">
      <div>Tambusai Utara, 10 September 2026</div>
      <div class="font-bold uppercase">Ketua Umum LPTQ Kec. Tambusai Utara</div>
      <div class="h-20 flex items-center justify-center">
        <!-- Stempel Resmi -->
        <span class="text-neutral-400 italic">[Tanda Tangan & Stempel Resmi]</span>
      </div>
      <div class="font-bold uppercase border-b border-black inline-block px-4">RAHMAT SAPUTRA</div>
    </div>
  </div>
</div>`;

export default function EditJuknisPage() {
  const router = useRouter();
  const { isSuperAdmin, isKecamatanAdmin } = useAuth();
  const canEdit = isSuperAdmin || isKecamatanAdmin;

  const [settings, setSettings] = useState<JuknisSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingWord, setUploadingWord] = useState(false);
  const [htmlSubTab, setHtmlSubTab] = useState<'parameters' | 'editor' | 'preview'>('parameters');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss top-right toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load existing settings
  useEffect(() => {
    fetch('/api/meta/branding', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setSettings((prev) => ({
            ...prev,
            ...json.data,
            juknis_mode: (json.data.juknis_mode as any) || 'custom',
            juknis_pdf_url: json.data.juknis_pdf_url || prev.juknis_pdf_url,
            juknis_word_url: json.data.juknis_word_url || '',
            juknis_custom_html: json.data.juknis_custom_html || '',
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setToast({ message: 'Hanya berkas PDF yang diperbolehkan.', type: 'error' });
      return;
    }

    setUploadingPdf(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'juknis');

      const res = await fetch('/api/admin/cdn/upload', {
        method: 'POST',
        body,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal mengunggah PDF.');

      setSettings((prev) => ({ ...prev, juknis_pdf_url: json.data?.url || prev.juknis_pdf_url }));
      setToast({ message: 'Berkas PDF berhasil diunggah.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal mengunggah berkas.', type: 'error' });
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.docx') && !lowerName.endsWith('.doc')) {
      setToast({ message: 'Hanya berkas Word (.docx atau .doc) yang diperbolehkan.', type: 'error' });
      return;
    }

    setUploadingWord(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'juknis');

      const res = await fetch('/api/admin/cdn/upload', {
        method: 'POST',
        body,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal mengunggah berkas Word.');

      setSettings((prev) => ({ ...prev, juknis_word_url: json.data?.url || prev.juknis_word_url }));
      setToast({ message: 'Berkas Word berhasil diunggah.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal mengunggah berkas.', type: 'error' });
    } finally {
      setUploadingWord(false);
      if (wordInputRef.current) wordInputRef.current.value = '';
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        settings: [
          { key: 'juknis_mode', value: settings.juknis_mode },
          { key: 'juknis_pdf_url', value: settings.juknis_pdf_url },
          { key: 'juknis_word_url', value: settings.juknis_word_url },
          { key: 'juknis_custom_html', value: settings.juknis_custom_html },
          { key: 'juknis_letter_no', value: settings.juknis_letter_no },
          { key: 'juknis_letter_date', value: settings.juknis_letter_date },
          { key: 'event_official_name', value: settings.event_official_name },
          { key: 'event_dates', value: settings.event_dates },
          { key: 'event_location', value: settings.event_location },
          { key: 'lptq_chairman', value: settings.lptq_chairman },
          { key: 'lptq_secretariat', value: settings.lptq_secretariat },
          { key: 'submission_envelope', value: settings.submission_envelope },
        ],
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal menyimpan pengaturan.');

      setToast({ message: 'Juknis berhasil disimpan.', type: 'success' });
      // Redirect back after short delay
      setTimeout(() => {
        router.push('/admin/juknis');
      }, 800);
    } catch (err: any) {
      setToast({ message: err.message || 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadDefaultTemplate = () => {
    setSettings((prev) => ({ ...prev, juknis_custom_html: DEFAULT_HTML_TEMPLATE }));
    setToast({ message: 'Template bawaan berhasil dimuat.', type: 'success' });
  };

  if (!canEdit) {
    return (
      <div className="p-8 text-center bg-white border border-neutral-300 rounded-md max-w-lg mx-auto mt-10">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h2 className="text-base font-bold text-black">Akses Terbatas</h2>
        <p className="text-xs text-neutral-600 mt-1">
          Halaman ini hanya dapat diakses oleh Administrator LPTQ.
        </p>
        <Link href="/admin/juknis" className="mt-4 inline-block">
          <Button variant="outline" size="sm" className="text-xs">
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full pb-16">
      {/* Top-Right Notification Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold shadow-lg border transition-all duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-300">
        <div className="flex items-center gap-3">
          <Link href="/admin/juknis">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black">Edit Juknis</h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              Pilih format dokumen aktif dan sesuaikan parameter juknis resmi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/juknis">
            <Button variant="outline" size="sm" disabled={saving} className="text-xs font-semibold rounded-md">
              Batal
            </Button>
          </Link>
          <Button
            type="button"
            size="sm"
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="text-xs font-semibold gap-1.5 rounded-md"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Simpan
          </Button>
        </div>
      </div>

      {/* Format Selection Cards (Ultra-Minimalist 3 Options) */}
      <div className="bg-white border border-neutral-300 rounded-md p-5 space-y-4">
        <div>
          <h2 className="text-xs font-bold text-black uppercase tracking-wider">
            Format Dokumen Aktif
          </h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Pilih bagaimana petunjuk teknis disajikan di portal admin dan publik.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Kustom HTML */}
          <div
            onClick={() => setSettings({ ...settings, juknis_mode: 'custom' })}
            className={`p-4 rounded-md border cursor-pointer transition-all ${
              settings.juknis_mode === 'custom'
                ? 'border-black bg-neutral-900 text-white shadow-xs'
                : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <FileCode className={`w-5 h-5 ${settings.juknis_mode === 'custom' ? 'text-amber-400' : 'text-neutral-700'}`} />
              {settings.juknis_mode === 'custom' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white text-black rounded-xs">Aktif</span>
              )}
            </div>
            <h3 className="text-xs font-bold">Kustom HTML</h3>
            <p className={`text-[11px] mt-1 ${settings.juknis_mode === 'custom' ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Naskah dinas interaktif, font Times New Roman, dan kop surat resmi.
            </p>
          </div>

          {/* Option 2: Dokumen PDF */}
          <div
            onClick={() => setSettings({ ...settings, juknis_mode: 'pdf' })}
            className={`p-4 rounded-md border cursor-pointer transition-all ${
              settings.juknis_mode === 'pdf'
                ? 'border-black bg-neutral-900 text-white shadow-xs'
                : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className={`w-5 h-5 ${settings.juknis_mode === 'pdf' ? 'text-amber-400' : 'text-neutral-700'}`} />
              {settings.juknis_mode === 'pdf' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white text-black rounded-xs">Aktif</span>
              )}
            </div>
            <h3 className="text-xs font-bold">Dokumen PDF</h3>
            <p className={`text-[11px] mt-1 ${settings.juknis_mode === 'pdf' ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Unggah berkas PDF resmi ke CDN untuk pratinjau dan unduh langsung.
            </p>
          </div>

          {/* Option 3: Dokumen Word */}
          <div
            onClick={() => setSettings({ ...settings, juknis_mode: 'word' })}
            className={`p-4 rounded-md border cursor-pointer transition-all ${
              settings.juknis_mode === 'word'
                ? 'border-black bg-neutral-900 text-white shadow-xs'
                : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <File className={`w-5 h-5 ${settings.juknis_mode === 'word' ? 'text-amber-400' : 'text-blue-600'}`} />
              {settings.juknis_mode === 'word' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white text-black rounded-xs">Aktif</span>
              )}
            </div>
            <h3 className="text-xs font-bold">Dokumen Word</h3>
            <p className={`text-[11px] mt-1 ${settings.juknis_mode === 'word' ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Unggah berkas Word (.docx / .doc) untuk pengeditan dan unduhan staf.
            </p>
          </div>
        </div>
      </div>

      {/* PANEL 1: KUSTOM HTML MODE */}
      {settings.juknis_mode === 'custom' && (
        <div className="space-y-4">
          {/* Sub-tab navigation */}
          <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHtmlSubTab('parameters')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                  htmlSubTab === 'parameters'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                }`}
              >
                Parameter Naskah
              </button>
              <button
                type="button"
                onClick={() => setHtmlSubTab('editor')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                  htmlSubTab === 'editor'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                }`}
              >
                Editor HTML
              </button>
              <button
                type="button"
                onClick={() => setHtmlSubTab('preview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                  htmlSubTab === 'preview'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                }`}
              >
                Pratinjau Lembar A4
              </button>
            </div>

            {htmlSubTab === 'editor' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadDefaultTemplate}
                className="text-xs font-semibold gap-1.5 rounded-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Muat Template Bawaan
              </Button>
            )}
          </div>

          {/* Sub-panel A: Parameters */}
          {htmlSubTab === 'parameters' && (
            <div className="bg-white border border-neutral-300 rounded-md p-5 space-y-4">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-2">
                Parameter Naskah Dinas
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nomor Surat
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.juknis_letter_no}
                    onChange={(e) => setSettings({ ...settings, juknis_letter_no: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Tanggal Surat
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.juknis_letter_date}
                    onChange={(e) => setSettings({ ...settings, juknis_letter_date: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nama Resmi Kegiatan
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.event_official_name}
                    onChange={(e) => setSettings({ ...settings, event_official_name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.event_dates}
                    onChange={(e) => setSettings({ ...settings, event_dates: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Ketua Umum LPTQ
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.lptq_chairman}
                    onChange={(e) => setSettings({ ...settings, lptq_chairman: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Lokasi Pelaksanaan
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.event_location}
                    onChange={(e) => setSettings({ ...settings, event_location: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Alamat Sekretariat
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.lptq_secretariat}
                    onChange={(e) => setSettings({ ...settings, lptq_secretariat: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Ketentuan Wadah Berkas
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.submission_envelope}
                    onChange={(e) => setSettings({ ...settings, submission_envelope: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sub-panel B: HTML Editor */}
          {htmlSubTab === 'editor' && (
            <div className="bg-white border border-neutral-300 rounded-md p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-black uppercase tracking-wider">
                    Editor HTML Kustom
                  </h2>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Tulis atau tempel kode HTML naskah dinas. Menggunakan tipografi Times New Roman.
                  </p>
                </div>
              </div>

              <textarea
                rows={20}
                value={settings.juknis_custom_html}
                onChange={(e) => setSettings({ ...settings, juknis_custom_html: e.target.value })}
                placeholder="<!-- Kosongkan untuk menggunakan naskah dinas resmi 8 halaman standar, atau tulis kode HTML kustom di sini -->"
                className="w-full font-mono text-xs p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-neutral-900 text-neutral-100 leading-normal"
              />
              <p className="text-[11px] text-neutral-500">
                Jika kolom HTML dikosongkan, sistem otomatis menampilkan naskah dinas resmi 8 halaman standar LPTQ Tambusai Utara.
              </p>
            </div>
          )}

          {/* Sub-panel C: Live Preview */}
          {htmlSubTab === 'preview' && (
            <div className="bg-neutral-200 border border-neutral-300 rounded-md p-4 sm:p-8 flex justify-center overflow-x-auto">
              <div className="w-full max-w-4xl bg-white shadow-md border border-neutral-300 rounded-xs p-8 sm:p-12 font-tnr text-black">
                {settings.juknis_custom_html ? (
                  <div
                    className="font-tnr leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: settings.juknis_custom_html }}
                  />
                ) : (
                  <div className="font-tnr text-black leading-relaxed space-y-4">
                    {/* Official Kop Preview */}
                    <div className="text-center pb-3">
                      <h2 className="text-sm font-bold uppercase tracking-tight">
                        {JUKNIS_OFFICIAL_HEADER.instansi_baris1}
                      </h2>
                      <h1 className="text-lg font-black uppercase tracking-tight mt-0.5">
                        {JUKNIS_OFFICIAL_HEADER.instansi_baris2}
                      </h1>
                      <h3 className="text-xs font-bold uppercase mt-0.5">
                        {JUKNIS_OFFICIAL_HEADER.instansi_baris3}
                      </h3>
                      <p className="text-[11px] italic mt-1 text-neutral-700">
                        {settings.lptq_secretariat}
                      </p>
                    </div>
                    <div style={{ borderBottom: '3px double #000', marginBottom: '20px' }}></div>

                    <div className="grid grid-cols-12 gap-2 text-xs mb-6 font-tnr">
                      <div className="col-span-8 space-y-1">
                        <div><strong>Nomor</strong> : {settings.juknis_letter_no}</div>
                        <div><strong>Lampiran</strong> : 1 (satu) Berkas</div>
                        <div><strong>Perihal</strong> : Petunjuk Teknis Cabang Lomba MTQ ke-XIX 2026</div>
                      </div>
                      <div className="col-span-4 text-xs">
                        <div>Kepada Yth:</div>
                        <div>Kepala Desa & LPTK Desa se-Kec. Tambusai Utara</div>
                        <div>di - Tempat</div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-justify indent-8">
                      Petunjuk teknis resmi pelaksanaan MTQ XIX Tambusai Utara 2026 di {settings.event_location}. Berkas administrasi wajib diserahkan dalam {settings.submission_envelope}.
                    </p>

                    <div className="mt-12 flex justify-end font-tnr text-xs">
                      <div className="w-64 text-center space-y-1">
                        <div>Tambusai Utara, {settings.juknis_letter_date}</div>
                        <div className="font-bold uppercase">Ketua Umum LPTQ</div>
                        <div className="h-16 flex items-center justify-center italic text-neutral-400">
                          [Stempel & Tanda Tangan]
                        </div>
                        <div className="font-bold uppercase border-b border-black inline-block px-3">
                          {settings.lptq_chairman}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PANEL 2: DOKUMEN PDF MODE */}
      {settings.juknis_mode === 'pdf' && (
        <div className="bg-white border border-neutral-300 rounded-md p-5 space-y-4">
          <div>
            <h2 className="text-xs font-bold text-black uppercase tracking-wider">
              Pengaturan Dokumen PDF
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Unggah berkas PDF baru (maks. 25 MB) yang akan ditampilkan langsung di portal.
            </p>
          </div>

          <div className="border border-dashed border-neutral-300 rounded-md p-6 bg-neutral-50 text-center space-y-3">
            <div className="w-12 h-12 rounded-md bg-neutral-200 text-neutral-700 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-black">
                {settings.juknis_pdf_url ? 'Berkas PDF Aktif' : 'Belum Ada Berkas PDF'}
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-0.5 break-all max-w-lg mx-auto">
                {settings.juknis_pdf_url || 'Silakan unggah dokumen PDF resmi'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingPdf}
                onClick={() => pdfInputRef.current?.click()}
                className="text-xs font-semibold gap-1.5 rounded-md"
              >
                {uploadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Pilih PDF</span>
                  </>
                )}
              </Button>

              {settings.juknis_pdf_url && (
                <a
                  href={settings.juknis_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-neutral-300 bg-white text-neutral-800 rounded-md hover:bg-neutral-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Pratinjau</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              URL Berkas PDF
            </label>
            <input
              type="text"
              value={settings.juknis_pdf_url}
              onChange={(e) => setSettings({ ...settings, juknis_pdf_url: e.target.value })}
              className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>
        </div>
      )}

      {/* PANEL 3: DOKUMEN WORD MODE */}
      {settings.juknis_mode === 'word' && (
        <div className="bg-white border border-neutral-300 rounded-md p-5 space-y-4">
          <div>
            <h2 className="text-xs font-bold text-black uppercase tracking-wider">
              Pengaturan Dokumen Word
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Unggah berkas Word (.docx atau .doc, maks. 25 MB) ke penyimpanan cloud Neon.
            </p>
          </div>

          <div className="border border-dashed border-neutral-300 rounded-md p-6 bg-neutral-50 text-center space-y-3">
            <div className="w-12 h-12 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center mx-auto">
              <File className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-black">
                {settings.juknis_word_url ? 'Berkas Word Aktif' : 'Belum Ada Berkas Word'}
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-0.5 break-all max-w-lg mx-auto">
                {settings.juknis_word_url || 'Silakan unggah dokumen Word (.docx / .doc)'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <input
                ref={wordInputRef}
                type="file"
                accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                onChange={handleWordUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingWord}
                onClick={() => wordInputRef.current?.click()}
                className="text-xs font-semibold gap-1.5 rounded-md"
              >
                {uploadingWord ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Pilih Word</span>
                  </>
                )}
              </Button>

              {settings.juknis_word_url && (
                <a
                  href={settings.juknis_word_url}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-neutral-300 bg-white text-neutral-800 rounded-md hover:bg-neutral-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              URL Berkas Word
            </label>
            <input
              type="text"
              value={settings.juknis_word_url}
              onChange={(e) => setSettings({ ...settings, juknis_word_url: e.target.value })}
              placeholder="/api/cdn/juknis/..."
              className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between bg-white border border-neutral-300 rounded-md p-4">
        <span className="text-xs text-neutral-500">
          Format aktif: <strong className="text-black uppercase">{settings.juknis_mode}</strong>
        </span>
        <div className="flex items-center gap-2">
          <Link href="/admin/juknis">
            <Button variant="outline" size="sm" disabled={saving} className="text-xs font-semibold rounded-md">
              Batal
            </Button>
          </Link>
          <Button
            type="button"
            size="sm"
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="text-xs font-semibold gap-1.5 rounded-md"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
