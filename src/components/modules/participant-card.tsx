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
  const categoryName = category?.name || 'Musabaqah';
  const branchInfo = getCategoryBranchInfo(categoryName);
  const registrationNo = `MTQ19-${participant.nik ? participant.nik.slice(-6) : participant.id.slice(0, 6).toUpperCase()}`;

  // QR Code points to the dedicated public verification page
  useEffect(() => {
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || '');
    const verifyUrl = `${origin}/peserta/${participant.id}`;

    QRCode.toDataURL(verifyUrl, {
      width: 180,
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

  const isVerified = participant.status_code === 'VERIFIED';
  const genderLabel =
    (participant.gender_code as string) === 'M' || participant.gender_code === 'MALE'
      ? 'Putra'
      : 'Putri';

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="print:hidden flex items-center justify-between gap-2 pb-2 border-b border-neutral-200 max-w-sm mx-auto">
        <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
          Kartu Peserta
        </span>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
          )}
          <Button size="sm" onClick={handlePrint} className="gap-1.5 text-xs font-bold">
            <Printer className="w-3.5 h-3.5" />
            Cetak
          </Button>
        </div>
      </div>

      {/* Professional Compact Badge Card */}
      <div className="flex justify-center print:m-0 print:p-0">
        <div
          ref={cardRef}
          className="w-full max-w-[340px] bg-white border-2 border-black rounded-md p-4 text-black shadow-xs flex flex-col justify-between print:border-2 print:border-black print:shadow-none print:w-[320px] print:rounded-md print:break-inside-avoid"
          style={{ minHeight: '480px' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center p-0.5 bg-white border border-neutral-300 rounded-sm overflow-hidden">
              <img
                src={activeLogoUrl}
                alt="LPTQ"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <span className="text-[9px] font-mono uppercase text-neutral-600 font-bold block truncate">
                MTQ XIX TAMBUSAI UTARA 2026
              </span>
              <h1 className="text-xs font-black uppercase text-black tracking-wide block">
                KARTU PESERTA
              </h1>
            </div>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-sm uppercase tracking-wider ${
                isVerified ? 'bg-black text-white' : 'bg-neutral-200 text-black'
              }`}
            >
              {isVerified ? 'SAH' : 'TERDAFTAR'}
            </span>
          </div>

          {/* Photo & Identity */}
          <div className="py-3 flex flex-col items-center text-center space-y-2">
            {/* 3x4 Photo */}
            <div className="w-24 h-32 border-2 border-black bg-neutral-100 rounded-md overflow-hidden flex flex-col items-center justify-center shadow-xs">
              {photoUrl ? (
                <img src={photoUrl} alt={participant.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2">
                  <UserIcon className="w-10 h-10 text-neutral-400 mx-auto mb-1" />
                  <span className="text-[8px] font-mono text-neutral-500 block uppercase font-bold">Foto 3x4</span>
                </div>
              )}
            </div>

            {/* Name & Details */}
            <div className="space-y-1 w-full px-1">
              <h2 className="text-sm font-black text-black uppercase leading-tight line-clamp-2">
                {participant.name}
              </h2>
              <div className="text-xs font-bold text-black uppercase">
                Kafilah Desa {participant.village_name || participant.lptk_name || '-'}
              </div>
              <div className="pt-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm bg-neutral-100 border border-neutral-300 text-black leading-tight">
                  {categoryName} • {genderLabel}
                </span>
              </div>
              <div className="text-[10px] font-mono text-neutral-500 pt-0.5">
                {registrationNo}
              </div>
            </div>
          </div>

          {/* QR Code & Digital Stamp */}
          <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-3">
            {/* QR Code */}
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 border border-black p-0.5 bg-white rounded-sm flex-shrink-0">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-[8px] font-mono">
                    QR
                  </div>
                )}
              </div>
              <div className="text-left text-[9px] text-neutral-600 leading-tight">
                <span className="font-bold text-black uppercase block">Verifikasi</span>
                <span className="block text-[8px] text-neutral-500">Pindai untuk melihat detail peserta.</span>
              </div>
            </div>

            {/* Signature & Stamp */}
            <div className="text-right text-[9px] relative min-w-[100px]">
              <div className="absolute right-0 top-0 w-14 h-14 opacity-75 pointer-events-none select-none">
                <img
                  src={activeStampUrl}
                  alt="Stempel"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="block text-[8px] text-neutral-500 font-mono">Ketua Umum LPTQ</span>
              <div className="h-6" />
              <span className="font-bold text-black uppercase underline block text-[9px]">
                RAHMAT SAPUTRA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
