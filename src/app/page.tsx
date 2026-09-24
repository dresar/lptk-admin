import React from 'react';
import { PublicHeader } from '@/components/public/public-header';
import { PublicHero } from '@/components/public/public-hero';
import { ParticipantChecker } from '@/components/public/participant-checker';
import { BranchesSection } from '@/components/public/branches-section';
import { KafilahSection } from '@/components/public/kafilah-section';
import { NewsSection } from '@/components/public/news-section';
import { DocumentsSection } from '@/components/public/documents-section';
import { PublicFooter } from '@/components/public/public-footer';
import { MobileBottomNav } from '@/components/public/mobile-bottom-nav';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-amber-200">
      {/* Public Navigation Header */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <PublicHero />

        {/* 2. Cek Status Peserta / Live Verification Search */}
        <ParticipantChecker />

        {/* 3. Cabang & Golongan Musabaqah */}
        <BranchesSection />

        {/* 4. Profil Kafilah 11 Desa */}
        <KafilahSection />

        {/* 5. Warta & Informasi Terkini (News/Blog Feed) */}
        <NewsSection />

        {/* 6. Dokumen Publik & Unduh Juknis Resmi */}
        <DocumentsSection />
      </main>

      {/* Public Footer */}
      <PublicFooter />

      {/* Floating Mobile Bottom Navigation Dock (Smartphone users) */}
      <MobileBottomNav />
    </div>
  );
}
