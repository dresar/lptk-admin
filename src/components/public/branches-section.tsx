'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Award, Users, Palette, Music, Check, Sparkles, ArrowRight } from 'lucide-react';

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
      'Materi: Kurikulum Madrasah Aliyah, Ponpes, wawasan Al-Qur’an & wawasan kebangsaan.',
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
    personel: '11 Orang per Regu (Pa / Pi Campuran)',
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

export function BranchesSection() {
  const [activeTab, setActiveTab] = useState<string>('seni-baca');

  const activeBranch = BRANCHES_DATA.find((b) => b.id === activeTab) || BRANCHES_DATA[0];

  return (
    <section id="cabang" className="bg-white text-neutral-900 py-16 border-b border-stone-200 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="max-w-xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800">
              <span className="text-amber-600 font-bold">۞</span>
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              <span>Juknis Resmi No. 09/LPTQ-T.U/MTQ/IX/2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Cabang & Golongan Musabaqah MTQ XIX
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              6 cabang musabaqah dan 25 golongan lomba resmi di Mimbar Utama Desa Mahato.
            </p>
          </div>

          <div>
            <Link
              href="/cabang"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-emerald-900 text-xs font-semibold rounded-xl border border-stone-300 transition-colors shadow-xs"
            >
              <span>Katalog Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Buttons (Horizontal scrollable on mobile) */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 border-b border-stone-200 custom-scrollbar">
          {BRANCHES_DATA.map((b) => {
            const isActive = activeTab === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveTab(b.id)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 border ${
                  isActive
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md scale-[1.02]'
                    : 'bg-stone-50 text-neutral-700 border-stone-200 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200'
                }`}
              >
                {isActive && <span className="text-amber-300 font-bold">۞</span>}
                <span>{b.shortName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-stone-200 text-neutral-600'
                  }`}
                >
                  {b.categories.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Detail Card */}
        <div className="bg-stone-50 border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-600 font-bold text-lg">۞</span>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">{activeBranch.name}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 font-mono">
                <span className="px-2 py-0.5 bg-white border border-stone-200 rounded-md">Format: {activeBranch.format}</span>
                <span>•</span>
                <span className="px-2 py-0.5 bg-white border border-stone-200 rounded-md">Personel: {activeBranch.personel}</span>
              </div>
            </div>

            <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 border border-amber-300 rounded-full text-xs font-bold text-amber-900 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{activeBranch.categories.length} Golongan Lomba</span>
            </span>
          </div>

          {/* Grid: Golongan on Left, Technical Requirements on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* List of Golongan */}
            <div className="lg:col-span-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 font-mono flex items-center gap-1.5">
                <span className="text-amber-500">۞</span>
                <span>Daftar Golongan yang Dilombakan:</span>
              </h4>
              <div className="space-y-2">
                {activeBranch.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl text-xs hover:border-emerald-300 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 font-medium text-neutral-900">
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold">{cat.name}</span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex-shrink-0">
                      {cat.ageLimit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications & Age Limits */}
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 font-mono flex items-center gap-1.5">
                  <span className="text-amber-500">۞</span>
                  <span>Batasan Usia Peserta:</span>
                </h4>
                <ul className="space-y-2 text-xs text-neutral-700">
                  {activeBranch.ageRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 font-mono flex items-center gap-1.5">
                  <span className="text-amber-500">۞</span>
                  <span>Ketentuan Teknis Musabaqah:</span>
                </h4>
                <ul className="space-y-2 text-xs text-neutral-700">
                  {activeBranch.specs.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
