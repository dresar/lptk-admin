import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LPTK Mahato — Sistem Pendataan & Verifikasi Peserta',
  description: 'Admin Panel Sistem Pendataan dan Verifikasi Peserta Lomba LPTK Kecamatan Mahato',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-white text-black min-h-screen">{children}</body>
    </html>
  );
}
