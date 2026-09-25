'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Printer, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Participant } from '@/types/database';
import { getCategoryBranchInfo } from '@/data/juknis-official-data';

export interface ParticipantCardProps {
  participant: Participant;
  photoUrl?: string | null;
  logoUrl?: string | null;
  stampUrl?: string | null;
  onClose?: () => void;
  standalone?: boolean;
}

// Target cut-off date per Juknis MTQ XIX: 09 November 2026
const MTQ_CUTOFF_DATE = new Date(2026, 10, 9);

function calculateAgeAtMTQ(birthDateStr: string) {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;

  let years = MTQ_CUTOFF_DATE.getFullYear() - birth.getFullYear();
  let months = MTQ_CUTOFF_DATE.getMonth() - birth.getMonth();
  let days = MTQ_CUTOFF_DATE.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(MTQ_CUTOFF_DATE.getFullYear(), MTQ_CUTOFF_DATE.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

export function ParticipantCard({
  participant,
  photoUrl,
  logoUrl,
  stampUrl,
  onClose,
  standalone = false,
}: ParticipantCardProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [dynamicLogo, setDynamicLogo] = useState<string>('/api/cdn/logos/lptq-logo.png');
  const [dynamicStamp, setDynamicStamp] = useState<string>('/api/cdn/logos/lptq-stempel.png');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoUrl || !stampUrl) {
      fetch('/api/meta/branding', { cache: 'no-store' })
        .then((res) => res.json())
        .then((json) => {
          if (json?.data) {
            if (!logoUrl && json.data.app_logo_url) {
              setDynamicLogo(json.data.app_logo_url.replace(/\/api\/cdn\/cdn\//g, '/api/cdn/'));
            }
            if (!stampUrl && json.data.app_stamp_url) {
              setDynamicStamp(json.data.app_stamp_url.replace(/\/api\/cdn\/cdn\//g, '/api/cdn/'));
            }
          }
        })
        .catch(() => {});
    }
  }, [logoUrl, stampUrl]);

  const activeLogoUrl = logoUrl || dynamicLogo;
  const activeStampUrl = stampUrl || dynamicStamp;

  const category = participant.categories?.[0];
  const categoryName = category?.name || 'Cabang Belum Ditentukan';
  const branchInfo = getCategoryBranchInfo(categoryName);
  const age = calculateAgeAtMTQ(participant.birth_date);

  const registrationNo = `MTQ19-${participant.nik ? participant.nik.slice(-6) : participant.id.slice(0, 6).toUpperCase()}`;

  // QR Code points to the dedicated public verification page
  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL || '');
    const verifyUrl = `${origin}/peserta/${participant.id}`;

    QRCode.toDataURL(verifyUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR:', err));
  }, [participant.id]);

  const handlePrint = () => {
    window.print();
  };

  const formattedBirthDate = participant.birth_date
    ? new Date(participant.birth_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="print:hidden flex items-center justify-between gap-2 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-xs font-bold text-black uppercase tracking-wider">
            Kartu Peserta
          </h2>
          <p className="text-[11px] text-neutral-500">
            Format resmi ukuran setengah kertas A4 (A5).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
          )}
          <Button size="sm" onClick={handlePrint} className="gap-1.5 font-bold">
            <Printer className="w-3.5 h-3.5" />
            Cetak
          </Button>
        </div>
      </div>

      {/* Printable Card Container - Setengah Kertas A4 */}
      <div className="flex justify-center print:m-0 print:p-0">
        <div
          ref={cardRef}
          className="participant-card-a5 w-full max-w-xl bg-white border-2 border-black rounded-md p-5 sm:p-6 text-black shadow-sm print:border-2 print:border-black print:shadow-none print:w-full print:max-w-none print:rounded-none print:p-4"
        >
          {/* KOP RESMI LPTQ */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-black pb-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center p-1 bg-white border border-neutral-300 rounded-md overflow-hidden">
              <img
                src={activeLogoUrl}
                alt="Logo LPTQ"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex-1 text-center min-w-0">
              <h2 className="text-[10px] sm:text-[11px] font-bold tracking-widest text-neutral-800 uppercase leading-none">
                Lembaga Pengembangan Tilawatil Qur&apos;an (LPTQ)
              </h2>
              <h1 className="text-xs sm:text-sm font-black tracking-wider text-black uppercase mt-1 leading-tight">
                Kecamatan Tambusai Utara - Rokan Hulu
              </h1>
              <div className="my-1 py-0.5 border-y border-black">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
                  Kartu Tanda Peserta Musabaqah
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold text-neutral-700 leading-tight">
                MTQ XIX KECAMATAN TAMBUSAI UTARA TAHUN 2026 DI DESA MAHATO
              </p>
              <p className="text-[8px] sm:text-[9px] font-mono text-neutral-500 mt-0.5">
                Waktu Pelaksanaan: 09 – 13 November 2026 • Tuan Rumah: Desa Mahato
              </p>
            </div>

            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex flex-col items-center justify-center p-1 border border-neutral-300 rounded-md text-center bg-neutral-50">
              <span className="text-[8px] font-mono uppercase text-neutral-500 font-bold">Kafilah</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase leading-tight line-clamp-2">
                {participant.village_name || participant.lptk_name || 'Desa'}
              </span>
            </div>
          </div>

          {/* Bar Nomor Registrasi, Nomor Regu/Tampil & Status */}
          <div className="flex items-center justify-between py-2 px-2.5 bg-neutral-100 border-b border-neutral-300 text-xs font-mono mt-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-neutral-600">NO. REGISTRASI:</span>
              <span className="font-bold text-black tracking-wider text-xs">{registrationNo}</span>
            </div>

            {/* Nomor Peserta / Nomor Regu Kolektif (Besar & Menonjol) */}
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 bg-black text-white rounded-sm text-xs sm:text-sm font-black tracking-widest uppercase border border-black shadow-sm">
                {participant.team_role || branchInfo.format !== 'INDIVIDU'
                  ? `NO. REGU: ${participant.participant_number || 'SQ-01'}`
                  : `NO. TAMPIL: ${participant.participant_number || registrationNo}`}
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-neutral-800 text-white">
                {participant.status_code === 'VERIFIED' ? 'TERVERIFIKASI' : 'TERDAFTAR'}
              </span>
            </div>
          </div>

          {/* Body Identitas Peserta (2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3.5 pb-2">
            {/* Kolom Foto & Format Lomba */}
            <div className="sm:col-span-1 flex flex-col items-center justify-start space-y-2">
              <div className="w-28 h-36 sm:w-32 sm:h-40 border-2 border-black bg-neutral-100 rounded-md flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                {photoUrl || participant.photo_url ? (
                  <img
                    src={photoUrl || participant.photo_url!}
                    alt={participant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <UserIcon className="w-12 h-12 text-neutral-400 mx-auto mb-1" />
                    <span className="text-[9px] font-mono font-bold text-neutral-500 block uppercase leading-tight">
                      Pas Foto 3x4
                    </span>
                    <span className="text-[8px] text-neutral-400 block mt-0.5">
                      Tempel Foto Asli
                    </span>
                  </div>
                )}
              </div>

              {/* Badges: Format, Gender & Peran Khusus */}
              <div className="w-full space-y-1 text-center">
                {participant.team_role && (
                  <span className="inline-block w-full text-[10px] font-mono font-black py-0.5 px-1.5 rounded-sm border-2 border-black bg-black text-white uppercase tracking-wider">
                    {participant.team_role}
                  </span>
                )}
                <span className="inline-block w-full text-[10px] font-mono font-bold py-0.5 px-1.5 rounded-sm border border-neutral-400 bg-neutral-900 text-white uppercase">
                  {branchInfo.formatLabel}
                </span>
                <span className="inline-block w-full text-[10px] font-mono font-semibold py-0.5 px-1.5 rounded-sm border border-neutral-300 bg-neutral-100 text-neutral-800">
                  {participant.gender_code === 'MALE'
                    ? 'Putra'
                    : participant.gender_code === 'FEMALE'
                    ? 'Putri'
                    : 'Campuran (Pa/Pi)'}
                </span>
              </div>
            </div>

            {/* Kolom Biodata Peserta */}
            <div className="sm:col-span-2 text-xs space-y-1.5">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block leading-tight">
                    Nama Lengkap Peserta:
                  </span>
                  {participant.team_role && (
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 bg-neutral-200 text-black border border-neutral-400 rounded-sm uppercase">
                      Peran: {participant.team_role}
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-sm sm:text-base text-black uppercase leading-tight block mt-0.5">
                  {participant.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block leading-tight">
                    NIK (Sesuai KK):
                  </span>
                  <span className="font-mono font-bold text-xs text-black block tracking-wider">
                    {participant.nik}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block leading-tight">
                    Nomor WhatsApp / HP:
                  </span>
                  <span className="font-mono text-xs text-black block">
                    {participant.phone || '-'}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-neutral-200">
                <span className="text-[10px] text-neutral-500 font-bold uppercase block leading-tight">
                  Tempat, Tanggal Lahir & Usia:
                </span>
                <span className="text-xs text-black block font-medium">
                  {participant.birth_place}, {formattedBirthDate}
                  {age && (
                    <span className="font-mono font-bold text-neutral-800 ml-1">
                      ({age.years} Thn {age.months} Bln per 09 Nov 2026)
                    </span>
                  )}
                </span>
              </div>

              <div className="pt-1 border-t border-neutral-200">
                <span className="text-[10px] text-neutral-500 font-bold uppercase block leading-tight">
                  Kafilah Utusan:
                </span>
                <span className="font-bold text-xs text-black block uppercase">
                  {participant.village_name
                    ? `Desa ${participant.village_name}`
                    : participant.lptk_name || 'Kecamatan Tambusai Utara'}
                </span>
              </div>

              <div className="pt-1 border-t border-neutral-200 bg-neutral-50 p-2 rounded-md border border-neutral-300">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <span className="text-[9px] text-neutral-600 font-bold uppercase block leading-tight">
                      Cabang & Golongan Musabaqah:
                    </span>
                    <span className="font-black text-xs sm:text-sm text-black block leading-snug">
                      {categoryName}
                    </span>
                    <span className="text-[10px] text-neutral-600 block mt-0.5">
                      Induk: {branchInfo.branchName}
                    </span>
                  </div>
                </div>
                {(participant.team_name || branchInfo.format !== 'INDIVIDU') && (
                  <div className="mt-1.5 pt-1.5 border-t border-neutral-300 flex items-center justify-between text-[9px] font-mono flex-wrap gap-1">
                    <span className="font-bold text-black uppercase bg-neutral-200 px-1.5 py-0.5 rounded-sm">
                      {participant.team_name ? `Regu: ${participant.team_name}` : `Format: ${branchInfo.formatLabel}`}
                    </span>
                    <span className="text-neutral-800 font-bold uppercase">
                      {participant.team_role ? `Peran: ${participant.team_role}` : `Kafilah ${participant.village_name || 'Desa'}`}
                    </span>
                  </div>
                )}
              </div>

              {participant.school_or_institution && (
                <div className="pt-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block leading-tight">
                    Sekolah / Pesantren / Regu:
                  </span>
                  <span className="text-xs text-neutral-800 font-medium block">
                    {participant.school_or_institution}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bagian Pengesahan & Validasi Digital (Bawah) */}
          <div className="pt-3 border-t-2 border-black grid grid-cols-2 gap-4 items-end mt-2">
            {/* Sisi Kiri: Validasi Digital & QR */}
            <div className="flex items-center gap-2.5">
              {qrCodeDataUrl ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 border border-black p-0.5 bg-white rounded-md flex-shrink-0">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Validasi"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 border border-neutral-300 bg-neutral-100 flex items-center justify-center text-[9px] font-mono rounded-md">
                  QR
                </div>
              )}
              <div className="text-[9px] text-neutral-600 leading-tight">
                <span className="font-bold text-black uppercase block">Otentikasi Digital:</span>
                <span>Pindai QR untuk memvalidasi keabsahan peserta MTQ XIX.</span>
                <span className="block font-mono text-[8px] text-neutral-500 mt-0.5">
                  SK: 09/LPTQ-T.U/MTQ/IX/2026
                </span>
              </div>
            </div>

            {/* Sisi Kanan: Tanda Tangan & Stempel Resmi */}
            <div className="text-right text-[10px] leading-tight relative">
              <span className="block text-neutral-600">Tambusai Utara, 10 September 2026</span>
              <span className="block font-bold text-black mt-0.5">
                Ketua Umum LPTQ Kec. Tambusai Utara
              </span>

              {/* Area Tanda Tangan & Stempel */}
              <div className="h-16 relative flex items-center justify-end my-1">
                {/* Stempel image overlay */}
                <div className="absolute right-6 w-20 h-20 opacity-80 pointer-events-none select-none">
                  <img
                    src={activeStampUrl}
                    alt="Stempel LPTQ"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              <span className="font-extrabold text-black uppercase tracking-wider underline block text-xs">
                RAHMAT SAPUTRA
              </span>
              <span className="text-[9px] text-neutral-500 font-mono block">
                Ketua Umum LPTQ Tambusai Utara
              </span>
            </div>
          </div>

          {/* Catatan Ketentuan Resmi (Footer) */}
          <div className="mt-3 pt-2 border-t border-dashed border-neutral-300 text-[8px] sm:text-[9px] text-neutral-500 leading-tight space-y-0.5">
            <p>
              1. Kartu Tanda Peserta ini wajib dibawa saat verifikasi administrasi fisik dan tampil pada panggung musabaqah.
            </p>
            <p>
              2. Peserta wajib hadir di lokasi mimbar perlombaan Desa Mahato minimal 30 menit sebelum jadwal tampil.
            </p>
            <p>
              3. Seluruh berkas asli dan fotokopi rangkap 1 (satu) dimasukkan ke dalam <strong>Map Warna Biru</strong> diserahkan ke Sekretariat Panitia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
