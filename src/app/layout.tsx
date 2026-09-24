import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MTQ XIX Tambusai Utara 2026 : LPTQ Kecamatan',
  description: 'Portal Informasi Publik dan Cek Status Peserta MTQ XIX Tingkat Kecamatan Tambusai Utara Tahun 2026 di Desa Mahato',
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
