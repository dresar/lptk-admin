'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';
import { MobileBottomNav } from '@/components/public/mobile-bottom-nav';
import { Award, ArrowLeft, BookOpen, Clock, CheckCircle2, Search } from 'lucide-react';

interface BranchDetail {
  id: string;
  name: string;
  shortName: string;
  format: string;
  personel: string;
  ageRules: string[];
  specs: string[];
  categories: Array<{ name: string; ageLimit: string }>;
}

const BRANCHES_DATA: BranchDetail[] = [
  {
    id: 'seni-baca',
    name: "Cabang Seni Baca Al-Qur'an",
    shortName: 'Seni Baca',
    format: 'Individu',
    personel: '1 Orang (Pa / Pi)',
    ageRules: [
      'Golongan Tartil: Maksimal 12 tahun 11 bulan 29 hari.',
      'Golongan Tilawah Anak-anak: Maksimal 14 tahun 11 bulan 29 hari.',
      'Golongan Tilawah Remaja: Maksimal 24 tahun 11 bulan 29 hari.',
      'Golongan Tilawah Dewasa: Maksimal 40 tahun 11 bulan 29 hari.',
    ],
    specs: [
      'Materi Tartil: Juz 1 s.d Juz 10, durasi 5-7 menit.',
      'Materi Tilawah Anak & Remaja: Juz 1 s.d Juz 20, durasi 6-9 menit.',
      'Materi Tilawah Dewasa: Juz 1 s.d Juz 30, durasi 9-10 menit.',
      'Maqra diundi 16 jam sebelum tampil (Dewasa saat naik mimbar).',
    ],
    categories: [
      { name: "Tartil Al-Qur'an Putra", ageLimit: 'Max 12 thn' },
      { name: "Tartil Al-Qur'an Putri", ageLimit: 'Max 12 thn' },
      { name: 'Tilawah Anak-Anak Putra', ageLimit: 'Max 14 thn' },
      { name: 'Tilawah Anak-Anak Putri', ageLimit: 'Max 14 thn' },
      { name: 'Tilawah Remaja Putra', ageLimit: 'Max 24 thn' },
      { name: 'Tilawah Remaja Putri', ageLimit: 'Max 24 thn' },
      { name: 'Tilawah Dewasa Putra', ageLimit: 'Max 40 thn' },
      { name: 'Tilawah Dewasa Putri', ageLimit: 'Max 40 thn' },
    ],
  },
  {
    id: 'hafalan',
    name: "Cabang Hafalan Al-Qur'an (Hifzil)",
    shortName: 'Hafalan',
    format: 'Individu',
    personel: '1 Orang (Pa / Pi)',
    ageRules: [
      'Golongan 1 Juz & Tilawah: Maksimal 15 tahun 11 bulan 29 hari.',
      'Golongan 5 Juz & Tilawah: Maksimal 20 tahun 11 bulan 29 hari.',
      'Golongan 10 Juz: Maksimal 22 tahun 11 bulan 29 hari.',
    ],
    specs: [
      'Golongan 1 Juz: Tilawah Juz 1-10, hafalan Juz 1 atau Juz 30.',
      'Golongan 5 Juz: Tilawah Juz 1-20, hafalan Juz 1 s.d Juz 5 atau Juz 26-30.',
      'Golongan 10 Juz: Hafalan Juz 1 s.d Juz 10.',
      'Setiap peserta menjawab 3 pertanyaan hafalan (5-10 baris Bahriyyah).',
    ],
    categories: [
      { name: '1 Juz dan Tilawah Putra', ageLimit: 'Max 15 thn' },
      { name: '1 Juz dan Tilawah Putri', ageLimit: 'Max 15 thn' },
      { name: '5 Juz dan Tilawah Putra', ageLimit: 'Max 20 thn' },
      { name: '5 Juz dan Tilawah Putri', ageLimit: 'Max 20 thn' },
      { name: '10 Juz Putra', ageLimit: 'Max 22 thn' },
      { name: '10 Juz Putri', ageLimit: 'Max 22 thn' },
    ],
  },
  {
    id: 'fahmil',
    name: "Cabang Fahmil Al-Qur'an",
    shortName: 'Fahmil',
    format: 'Regu',
    personel: '3 Orang per Regu (Pa / Pi / Campuran)',
    ageRules: [
      'Golongan Anak Campuran: Usia maksimal 13 tahun 11 bulan 29 hari.',
      'Golongan Remaja Pa/Pi: Usia maksimal 18 tahun 11 bulan 29 hari.',
    ],
    specs: [
      'Materi: Kurikulum Madrasah Aliyah, Ponpes, wawasan Al-Qur’an & kebangsaan.',
      'Babak Penyisihan & Semi Final: 3 atau 4 regu per sesi.',
      'Paket Soal Regu: 10-12 pertanyaan amplop.',
      'Paket Soal Rebutan: 10-15 pertanyaan cepat tepat.',
    ],
    categories: [
      { name: 'Fahmil Qur’an Anak Campuran', ageLimit: 'Max 13 thn' },
      { name: 'Fahmil Qur’an Remaja Putra', ageLimit: 'Max 18 thn' },
      { name: 'Fahmil Qur’an Remaja Putri', ageLimit: 'Max 18 thn' },
    ],
  },
  {
    id: 'syarhil',
    name: "Cabang Syarhil Al-Qur'an",
    shortName: 'Syarhil',
    format: 'Regu',
    personel: '3 Orang per Regu (Tilawah, Terjemah, Syarah)',
    ageRules: [
      'Golongan Anak Campuran: Usia maksimal 13 tahun 11 bulan 29 hari.',
      'Golongan Remaja Pa/Pi: Usia maksimal 18 tahun 11 bulan 29 hari.',
    ],
    specs: [
      'Tiga Unsur Penampilan: Tilawatil Qur’an, Terjemahan deklamasi, Retorika pidato tanpa teks.',
      'Durasi Penampilan: 15-20 menit per regu.',
      'Memilih 3 dari 9 tema resmi LPTQ (Zakat, Kerukunan, Masjid, Lingkungan, Korupsi, dll).',
      'Penyisihan: Penentuan 1 judul 24 jam sebelum tampil.',
    ],
    categories: [
      { name: 'Syarhil Qur’an Anak Campuran', ageLimit: 'Max 13 thn' },
      { name: 'Syarhil Qur’an Remaja Putra', ageLimit: 'Max 18 thn' },
      { name: 'Syarhil Qur’an Remaja Putri', ageLimit: 'Max 18 thn' },
    ],
  },
  {
    id: 'kaligrafi',
    name: "Cabang Seni Kaligrafi Al-Qur'an",
    shortName: 'Kaligrafi',
    format: 'Individu',
    personel: '1 Orang (Pa / Pi)',
    ageRules: [
      'Seluruh Golongan Kaligrafi: Usia maksimal 34 tahun 11 bulan 29 hari.',
    ],
    specs: [
      'Golongan Naskah: Di atas kertas karton manila penuh, durasi 480 menit (8 jam).',
      'Golongan Hiasan Mushaf: Iluminasi ornamen gaya Al-Fatihah/Al-Baqarah, karton penuh.',
      'Golongan Dekorasi: Di atas papan triplek ukuran 122 x 80 cm.',
      'Golongan Kontemporer: Di atas kain kanvas berspanram ukuran 60 x 80 cm.',
    ],
    categories: [
      { name: 'Kaligrafi Naskah Pa/Pi', ageLimit: 'Max 34 thn' },
      { name: 'Kaligrafi Hiasan Mushaf Pa/Pi', ageLimit: 'Max 34 thn' },
      { name: 'Kaligrafi Dekorasi Pa/Pi', ageLimit: 'Max 34 thn' },
      { name: 'Kaligrafi Kontemporer Pa/Pi', ageLimit: 'Max 34 thn' },
    ],
  },
  {
    id: 'rebana',
    name: 'Cabang Rebana Klasik',
    shortName: 'Rebana',
    format: 'Regu',
    personel: '11 Orang per Regu (Campuran)',
    ageRules: [
      'Usia maksimal peserta: 38 tahun 11 bulan 29 hari.',
    ],
    specs: [
      'Qasidah Wajib: "Al-Qur’an" dipopulerkan Hj. Nur Asiah Djamil.',
      'Qasidah Pilihan: Magadir, Perdamaian, Kasih Sayang Bunda, atau Jilbab Putih.',
      'Durasi Penampilan: Maksimal 15 menit (termasuk cek suara).',
      'Instrumen Akustik Klasik: Dilarang menggunakan alat musik elektrik atau seruling/biola.',
    ],
    categories: [
      { name: 'Rebana Klasik Remaja & Dewasa (Campuran)', ageLimit: 'Max 38 thn' },
    ],
  },
];

export default function CabangPage() {
  const [activeTab, setActiveTab] = useState<string>('seni-baca');
  const [searchTerm, setSearchTerm] = useState('');

  const activeBranch = BRANCHES_DATA.find((b) => b.id === activeTab) || BRANCHES_DATA[0];

  const filteredBranches = searchTerm
    ? BRANCHES_DATA.filter(
        (b) =>
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.categories.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : BRANCHES_DATA;

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-amber-200">
      <PublicHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-[11px] font-mono text-neutral-500">
            6 Cabang • 25 Golongan
          </span>
        </div>

        {/* Header Section: Rectangular with rounded-md */}
        <div className="bg-white border border-neutral-300 rounded-md p-6 sm:p-7 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-500 text-xs">۞</span>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-800">
              Katalog Musabaqah Resmi
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Cabang & Golongan Lomba MTQ XIX 2026
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
            Daftar lengkap ketentuan teknis, batas usia peserta, format penampilan, dan materi musabaqah resmi Desa Mahato.
          </p>

          {/* Quick Search */}
          <div className="mt-5 relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari cabang atau nama golongan..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Branch Selection Buttons: Rectangular with rounded-md */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {filteredBranches.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveTab(b.id)}
              className={`p-3 rounded-md border text-left transition-colors text-xs font-semibold ${
                activeTab === b.id
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className="text-[10px] font-mono opacity-80 uppercase">{b.format}</div>
              <div className="text-xs font-bold mt-0.5 truncate">{b.shortName}</div>
              <div className="text-[10px] opacity-75 mt-1 font-mono">
                {b.categories.length} Golongan
              </div>
            </button>
          ))}
        </div>

        {/* Active Branch Detail Card: Rectangular with rounded-md */}
        <div className="bg-white border border-neutral-300 rounded-md p-5 sm:p-7 shadow-xs space-y-6">
          {/* Top Title */}
          <div className="pb-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-semibold bg-emerald-100 border border-emerald-300 rounded-md text-emerald-800 mb-2">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>Format: {activeBranch.format} ({activeBranch.personel})</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                {activeBranch.name}
              </h2>
            </div>
            <a
              href="/documents/juknis-mtq-xix-tambusai-utara-2026.pdf"
              download="juknis-mtq-xix-tambusai-utara-2026.pdf"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-md transition-colors border border-neutral-300 self-start sm:self-auto"
            >
              <span>Unduh Juknis PDF</span>
            </a>
          </div>

          {/* Golongan Grid */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-xs bg-emerald-600" />
              <span>Daftar Golongan Perlombaan ({activeBranch.categories.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {activeBranch.categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-50 border border-neutral-300 rounded-md p-3.5 hover:border-emerald-600 transition-colors"
                >
                  <div className="text-xs font-bold text-neutral-900 leading-snug">{cat.name}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-neutral-500">Batas Usia:</span>
                    <span className="px-2 py-0.5 bg-white border border-neutral-300 rounded-sm text-emerald-800 font-semibold">
                      {cat.ageLimit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules & Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-neutral-200">
            {/* Age Rules */}
            <div className="bg-neutral-50 border border-neutral-300 rounded-md p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Ketentuan Batasan Usia</span>
              </h4>
              <ul className="space-y-2 text-xs text-neutral-700">
                {activeBranch.ageRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Specs */}
            <div className="bg-neutral-50 border border-neutral-300 rounded-md p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Materi & Durasi Penampilan</span>
              </h4>
              <ul className="space-y-2 text-xs text-neutral-700">
                {activeBranch.specs.map((spec, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}
