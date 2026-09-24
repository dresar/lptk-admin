export interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  info: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image_url: '/api/cdn/hero/mtq-hero-mahato.jpg',
    title: "Musabaqah Tilawatil Qur'an XIX Tingkat Kecamatan Tambusai Utara",
    subtitle: "Pusat informasi resmi dan portal verifikasi data peserta MTQ XIX Tahun 2026 di Desa Mahato.",
    info: "09 – 13 November 2026 • Mimbar Utama Desa Mahato",
  },
  {
    id: 'slide-2',
    image_url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1600&q=80',
    title: "Syiar Al-Qur'an Merajut Ukhuwah di Bumi Mahato",
    subtitle: "Sebelas kafilah desa se-Kecamatan Tambusai Utara bersatu dalam syiar dan musabaqah tilawah.",
    info: "11 Kafilah Desa • 6 Cabang • 25 Golongan Musabaqah",
  },
  {
    id: 'slide-3',
    image_url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1600&q=80',
    title: "Verifikasi Berkas & Transparansi Keabsahan Peserta",
    subtitle: "Layanan mandiri cek keabsahan peserta melalui NIK dan pengunduhan buku juknis resmi.",
    info: "Sekretariat KUA Rantau Kasai • Panitia Pelaksana Desa Mahato",
  },
];
