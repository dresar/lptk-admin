'use client';

import React, { useState } from 'react';
import { BookOpen, Award, Users, Palette, Music, Check, Sparkles } from 'lucide-react';

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
    <section id="cabang" className="bg-white text-black py-14 border-b border-neutral-200 scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-mono bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
            <Award className="w-3.5 h-3.5 text-black" />
            Juknis Resmi No. 09/LPTQ-T.U/MTQ/IX/2026
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
            Cabang & Golongan Musabaqah MTQ XIX
          </h2>
          <p className="text-xs text-neutral-600">
            6 cabang musabaqah dan 25 golongan lomba resmi yang dipertandingkan di Desa Mahato
          </p>
        </div>

        {/* Tab Buttons (Horizontal scrollable on mobile) */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-neutral-200 custom-scrollbar">
          {BRANCHES_DATA.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveTab(b.id)}
              className={`px-4 py-2.5 rounded text-xs font-semibold whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === b.id
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {b.shortName}
            </button>
          ))}
        </div>

        {/* Tab Detail Card (Solid High-Contrast) */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200">
            <div>
              <h3 className="text-lg font-bold text-black">{activeBranch.name}</h3>
              <div className="flex items-center gap-3 text-xs text-neutral-600 mt-1 font-mono">
                <span>Format: {activeBranch.format}</span>
                <span>•</span>
                <span>Personel: {activeBranch.personel}</span>
              </div>
            </div>

            <span className="self-start sm:self-auto inline-flex items-center px-3 py-1 bg-white border border-neutral-300 rounded text-xs font-mono font-medium text-black">
              {activeBranch.categories.length} Golongan Lomba
            </span>
          </div>

          {/* Grid: Golongan on Left, Technical Requirements on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* List of Golongan */}
            <div className="md:col-span-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                Daftar Golongan yang Dilombakan:
              </h4>
              <div className="space-y-2">
                {activeBranch.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white border border-neutral-200 rounded text-xs"
                  >
                    <div className="flex items-center gap-2 font-medium text-black">
                      <span className="w-5 h-5 rounded bg-neutral-100 text-neutral-700 flex items-center justify-center text-[10px] font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                      {cat.ageLimit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications & Age Limits */}
            <div className="md:col-span-6 space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                  Batasan Usia Peserta:
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-700">
                  {activeBranch.ageRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded border border-neutral-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                  Ketentuan Teknis Musabaqah:
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-700">
                  {activeBranch.specs.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded border border-neutral-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0" />
                      <span>{spec}</span>
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
