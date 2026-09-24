import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

async function seedMahato() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not defined.');
    process.exit(1);
  }

  console.log('🌱 Seeding rich realistic data for Mahato - Rokan Hulu in Neon DB...');
  const sql = neon(databaseUrl);

  try {
    // -------------------------------------------------------------------------
    // 1. Roles & Permissions Check
    // -------------------------------------------------------------------------
    console.log('1. Checking roles...');
    const roles = [
      { code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Akses penuh ke semua modul sistem', is_system: true },
      { code: 'ADMIN_KECAMATAN', name: 'Admin Kecamatan', description: 'Verifikator dan pengelola lomba tingkat kecamatan', is_system: true },
      { code: 'OPERATOR_LPTK', name: 'Operator LPTK', description: 'Pengelola pendaftaran peserta LPTK desa/kelurahan', is_system: true },
    ];
    for (const r of roles) {
      await sql`
        INSERT INTO auth.roles (code, name, description, is_system)
        VALUES (${r.code}, ${r.name}, ${r.description}, ${r.is_system})
        ON CONFLICT (code) DO UPDATE SET name = ${r.name}, description = ${r.description};
      `;
    }

    const [superAdminRole] = await sql`SELECT id FROM auth.roles WHERE code = 'SUPER_ADMIN'`;
    const [kecamatanRole] = await sql`SELECT id FROM auth.roles WHERE code = 'ADMIN_KECAMATAN'`;
    const [operatorRole] = await sql`SELECT id FROM auth.roles WHERE code = 'OPERATOR_LPTK'`;

    // -------------------------------------------------------------------------
    // 2. Document Types
    // -------------------------------------------------------------------------
    console.log('2. Seeding document types...');
    const docTypes = [
      { code: 'KTP', name: 'KTP / Kartu Identitas', is_required: true },
      { code: 'KK', name: 'Kartu Keluarga (KK)', is_required: true },
      { code: 'PAS_FOTO', name: 'Pas Foto Resmi (3x4)', is_required: true },
      { code: 'SURAT_MANDAT', name: 'Surat Mandat Desa / LPTK', is_required: true },
      { code: 'IJAZAH_AKTA', name: 'Ijazah / Akta Kelahiran', is_required: true },
    ];
    for (const dt of docTypes) {
      await sql`
        INSERT INTO public.document_types (code, name, is_required, active)
        VALUES (${dt.code}, ${dt.name}, ${dt.is_required}, true)
        ON CONFLICT (code) DO UPDATE SET name = ${dt.name}, is_required = ${dt.is_required};
      `;
    }

    // -------------------------------------------------------------------------
    // 3. 10 Real Villages in Tambusai Utara / Mahato, Rokan Hulu, Riau
    // -------------------------------------------------------------------------
    console.log('3. Seeding real 11 villages of Mahato & Tambusai Utara...');
    const villagesData = [
      { code: 'DESA-MAHATO', name: 'Desa Mahato' },
      { code: 'DESA-MAHATO-SAKTI', name: 'Desa Mahato Sakti' },
      { code: 'DESA-BANGUN-JAYA', name: 'Desa Bangun Jaya' },
      { code: 'DESA-TAMBUSAI-UTARA', name: 'Desa Tambusai Utara' },
      { code: 'DESA-RANTAU-SAKTI', name: 'Desa Rantau Sakti' },
      { code: 'DESA-PAGAR-MAYANG', name: 'Desa Pagar Mayang' },
      { code: 'DESA-SIMPANG-HARAPAN', name: 'Desa Simpang Harapan' },
      { code: 'DESA-SUKA-DAMAI', name: 'Desa Suka Damai' },
      { code: 'DESA-MEKAR-JAYA', name: 'Desa Mekar Jaya' },
      { code: 'DESA-PAYUNG-SEKAKI', name: 'Desa Payung Sekaki' },
      { code: 'DESA-TANJUNG-MEDAN', name: 'Desa Tanjung Medan' },
    ];

    const villageMap = {};
    for (const v of villagesData) {
      const rows = await sql`
        INSERT INTO public.villages (code, name)
        VALUES (${v.code}, ${v.name})
        ON CONFLICT (code) DO UPDATE SET name = ${v.name}, deleted_at = NULL
        RETURNING id, code, name;
      `;
      villageMap[v.code] = rows[0].id;
    }

    // -------------------------------------------------------------------------
    // 4. LPTK for each Village
    // -------------------------------------------------------------------------
    console.log('4. Seeding LPTK organizations...');
    const lptksData = [
      {
        villageCode: 'DESA-MAHATO',
        code: 'LPTK-MAHATO',
        name: 'LPTK Desa Mahato',
        leader: 'H. Ahmad Syukri, S.Pd.I',
        phone: '081268451120',
        address: 'Jl. Poros Mahato KM 12, Kompleks Masjid Raya Al-Muhajirin',
      },
      {
        villageCode: 'DESA-MAHATO-SAKTI',
        code: 'LPTK-MAHATO-SAKTI',
        name: 'LPTK Desa Mahato Sakti',
        leader: 'H. Muhammad Ridwan',
        phone: '081371239988',
        address: 'Jl. Pemda Mahato Sakti, RT 04/RW 02',
      },
      {
        villageCode: 'DESA-BANGUN-JAYA',
        code: 'LPTK-BANGUN-JAYA',
        name: 'LPTK Desa Bangun Jaya',
        leader: 'Ust. Zulkifli, S.Q',
        phone: '085278119022',
        address: 'Jl. Pendidikan No. 4, Bangun Jaya',
      },
      {
        villageCode: 'DESA-TAMBUSAI-UTARA',
        code: 'LPTK-TAMBUSAI-UTARA',
        name: 'LPTK Desa Tambusai Utara',
        leader: 'Ust. M. Dahlan, S.Ag',
        phone: '081275990033',
        address: 'Jl. Kantor Camat No. 1, Tambusai Utara',
      },
      {
        villageCode: 'DESA-RANTAU-SAKTI',
        code: 'LPTK-RANTAU-SAKTI',
        name: 'LPTK Desa Rantau Sakti',
        leader: 'Drs. H. Marzuki Harahap',
        phone: '081365448821',
        address: 'Jl. Lintas Rantau Sakti KM 3',
      },
      {
        villageCode: 'DESA-PAGAR-MAYANG',
        code: 'LPTK-PAGAR-MAYANG',
        name: 'LPTK Desa Pagar Mayang',
        leader: 'H. Ismail Hasan',
        phone: '085363221199',
        address: 'Jl. Mesjid Al-Huda Pagar Mayang',
      },
      {
        villageCode: 'DESA-SIMPANG-HARAPAN',
        code: 'LPTK-SIMPANG-HARAPAN',
        name: 'LPTK Desa Simpang Harapan',
        leader: 'H. Syamsuddin Siregar',
        phone: '082170112234',
        address: 'Jl. Melati Blok B, Simpang Harapan',
      },
      {
        villageCode: 'DESA-SUKA-DAMAI',
        code: 'LPTK-SUKA-DAMAI',
        name: 'LPTK Desa Suka Damai',
        leader: 'Ust. Nurhadi',
        phone: '081267883344',
        address: 'Jl. Transmigrasi Suka Damai',
      },
      {
        villageCode: 'DESA-MEKAR-JAYA',
        code: 'LPTK-MEKAR-JAYA',
        name: 'LPTK Desa Mekar Jaya',
        leader: 'Drs. H. Abdul Malik',
        phone: '085265449911',
        address: 'Jl. Utama Mekar Jaya RT 02',
      },
      {
        villageCode: 'DESA-PAYUNG-SEKAKI',
        code: 'LPTK-PAYUNG-SEKAKI',
        name: 'LPTK Desa Payung Sekaki',
        leader: 'H. Burhanuddin Lubis',
        phone: '081374556677',
        address: 'Jl. Swakarsa Payung Sekaki',
      },
      {
        villageCode: 'DESA-TANJUNG-MEDAN',
        code: 'LPTK-TANJUNG-MEDAN',
        name: 'LPTK Desa Tanjung Medan',
        leader: 'Ust. H. Syarifuddin',
        phone: '081270992211',
        address: 'Jl. Raya Tanjung Medan, Tambusai Utara',
      },
    ];

    const lptkMap = {};
    for (const l of lptksData) {
      const villageId = villageMap[l.villageCode];
      const rows = await sql`
        INSERT INTO public.lptks (village_id, code, name, leader_name, phone, address, active)
        VALUES (${villageId}, ${l.code}, ${l.name}, ${l.leader}, ${l.phone}, ${l.address}, true)
        ON CONFLICT (code) DO UPDATE SET 
          name = ${l.name}, 
          leader_name = ${l.leader}, 
          phone = ${l.phone}, 
          address = ${l.address},
          deleted_at = NULL
        RETURNING id, code, name;
      `;
      lptkMap[l.code] = rows[0].id;
    }

    // -------------------------------------------------------------------------
    // 5. Users for All Roles
    // -------------------------------------------------------------------------
    console.log('5. Seeding users for each role...');
    const defaultPasswordHash = await bcrypt.hash('admin123', 10);

    const usersData = [
      {
        email: 'eka.ckp16799@gmail.com',
        fullName: 'Eka Syarif Maulana',
        roleId: superAdminRole.id,
        lptkId: null,
      },
      {
        email: 'kecamatan.mahato@rohul.go.id',
        fullName: 'H. Faisal Rahman, S.Ag',
        roleId: kecamatanRole.id,
        lptkId: null,
      },
      {
        email: 'operator.mahato@lptk.id',
        fullName: 'Rahmat Hidayat, S.Kom',
        roleId: operatorRole.id,
        lptkId: lptkMap['LPTK-MAHATO'],
      },
      {
        email: 'operator.bangunjaya@lptk.id',
        fullName: 'Ahmad Subhan',
        roleId: operatorRole.id,
        lptkId: lptkMap['LPTK-BANGUN-JAYA'],
      },
    ];

    const userMap = {};
    for (const u of usersData) {
      const [user] = await sql`
        INSERT INTO auth.users (email, password_hash, full_name, role_id, lptk_id, active, must_change_password)
        VALUES (${u.email}, ${defaultPasswordHash}, ${u.fullName}, ${u.roleId}, ${u.lptkId}, true, false)
        ON CONFLICT (email) DO UPDATE SET 
          password_hash = ${defaultPasswordHash},
          full_name = ${u.fullName},
          role_id = ${u.roleId},
          lptk_id = ${u.lptkId},
          active = true
        RETURNING id, email, full_name;
      `;
      userMap[u.email] = user.id;
    }

    // -------------------------------------------------------------------------
    // 6. Competitions (Event MTQ & STQ Mahato 2026)
    // -------------------------------------------------------------------------
    console.log('6. Seeding competitions...');
    const competitionsData = [
      {
        name: 'MTQ Ke-XXIV Tingkat Kecamatan Tambusai Utara - Mahato 2026',
        description: 'Musabaqah Tilawatil Qur\'an Tingkat Kecamatan Tambusai Utara Tahun 2026 bertempat di Desa Mahato. Ajang seleksi kafilah menuju MTQ Kabupaten Rokan Hulu.',
        periodYear: 2026,
        statusCode: 'OPEN',
        regOpen: '2026-08-01T00:00:00Z',
        regClose: '2026-11-30T23:59:59Z',
        bannerUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'STQ Pelajar & Remaja Se-Mahato Raya 2026',
        description: 'Seleksi Tilawatil Qur\'an kategori santri dan pelajar desa se-Kawasan Mahato Raya.',
        periodYear: 2026,
        statusCode: 'OPEN',
        regOpen: '2026-09-01T00:00:00Z',
        regClose: '2026-12-15T23:59:59Z',
        bannerUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
      },
    ];

    const compMap = {};
    for (const c of competitionsData) {
      const existing = await sql`SELECT id FROM public.competitions WHERE name = ${c.name} LIMIT 1`;
      let compId;
      if (existing.length > 0) {
        compId = existing[0].id;
        await sql`
          UPDATE public.competitions SET
            description = ${c.description},
            period_year = ${c.periodYear},
            status_code = ${c.statusCode},
            banner_url = ${c.bannerUrl},
            deleted_at = NULL
          WHERE id = ${compId};
        `;
      } else {
        const [comp] = await sql`
          INSERT INTO public.competitions (name, description, period_year, status_code, registration_open_at, registration_close_at, banner_url)
          VALUES (${c.name}, ${c.description}, ${c.periodYear}, ${c.statusCode}, ${c.regOpen}, ${c.regClose}, ${c.bannerUrl})
          RETURNING id;
        `;
        compId = comp.id;
      }
      compMap[c.name] = compId;
    }

    const mainCompId = compMap['MTQ Ke-XXIV Tingkat Kecamatan Tambusai Utara - Mahato 2026'];

    // -------------------------------------------------------------------------
    // 7. Categories (Cabang Lomba)
    // -------------------------------------------------------------------------
    console.log('7. Seeding competition categories...');
    const categoriesData = [
      { name: 'Tilawah Anak-Anak Putra', gender: 'MALE', ageMin: 7, ageMax: 14, req: 'Membaca maqra yang diundi pada juz 1-10' },
      { name: 'Tilawah Anak-Anak Putri', gender: 'FEMALE', ageMin: 7, ageMax: 14, req: 'Membaca maqra yang diundi pada juz 1-10' },
      { name: 'Tilawah Remaja Putra', gender: 'MALE', ageMin: 15, ageMax: 20, req: 'Membaca maqra juz 1-20' },
      { name: 'Tilawah Remaja Putri', gender: 'FEMALE', ageMin: 15, ageMax: 20, req: 'Membaca maqra juz 1-20' },
      { name: 'Tilawah Dewasa Putra', gender: 'MALE', ageMin: 21, ageMax: 40, req: 'Membaca maqra bebas juz 1-30' },
      { name: 'Tilawah Dewasa Putri', gender: 'FEMALE', ageMin: 21, ageMax: 40, req: 'Membaca maqra bebas juz 1-30' },
      { name: 'Hifzil Qur\'an 1 Juz & Tilawah Putra', gender: 'MALE', ageMin: 7, ageMax: 14, req: 'Hafalan Juz 1 atau Juz 30 ditambah tilawah' },
      { name: 'Hifzil Qur\'an 1 Juz & Tilawah Putri', gender: 'FEMALE', ageMin: 7, ageMax: 14, req: 'Hafalan Juz 1 atau Juz 30 ditambah tilawah' },
      { name: 'Hifzil Qur\'an 5 Juz Putra', gender: 'MALE', ageMin: 9, ageMax: 16, req: 'Hafalan Juz 1 s.d. Juz 5' },
      { name: 'Hifzil Qur\'an 5 Juz Putri', gender: 'FEMALE', ageMin: 9, ageMax: 16, req: 'Hafalan Juz 1 s.d. Juz 5' },
      { name: 'Fahmil Qur\'an (Cerdas Cermat)', gender: 'ANY', ageMin: 12, ageMax: 19, req: 'Regu 3 orang peserta pelajar' },
      { name: 'Syarhil Qur\'an (Pidato)', gender: 'ANY', ageMin: 13, ageMax: 20, req: 'Regu 3 orang (pensyarah, qari, saritilawah)' },
      { name: 'Khattil Qur\'an (Kaligrafi)', gender: 'ANY', ageMin: 12, ageMax: 25, req: 'Golongan naskah dan hiasan mushaf' },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const existing = await sql`
        SELECT id FROM public.categories 
        WHERE competition_id = ${mainCompId} AND name = ${cat.name} 
        LIMIT 1;
      `;
      let catId;
      if (existing.length > 0) {
        catId = existing[0].id;
        await sql`
          UPDATE public.categories SET
            gender_code = ${cat.gender},
            age_min = ${cat.ageMin},
            age_max = ${cat.ageMax},
            requirements = ${cat.req},
            active = true,
            deleted_at = NULL
          WHERE id = ${catId};
        `;
      } else {
        const [inserted] = await sql`
          INSERT INTO public.categories (competition_id, name, gender_code, age_min, age_max, requirements, active)
          VALUES (${mainCompId}, ${cat.name}, ${cat.gender}, ${cat.ageMin}, ${cat.ageMax}, ${cat.req}, true)
          RETURNING id;
        `;
        catId = inserted.id;
      }
      categoryMap[cat.name] = catId;
    }

    // -------------------------------------------------------------------------
    // 8. 28 Rich Realistic Participants for Mahato & Rohul
    // -------------------------------------------------------------------------
    console.log('8. Seeding 28 rich realistic participants...');

    // Avatar URLs representing realistic Indonesian portraits
    const photos = {
      maleYoung: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      ],
      femaleYoung: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      ],
    };

    const participantsData = [
      // 1. Desa Mahato
      {
        name: 'Muhammad Farhan Al-Hafidz',
        nik: '1406081205080001',
        gender: 'MALE',
        birthPlace: 'Mahato',
        birthDate: '2008-05-12',
        address: 'Jl. Poros Mahato KM 11 RT 02/RW 03',
        phone: '081270881921',
        school: 'MAS Al-Muhajirin Mahato',
        father: 'Syamsul Bahri',
        mother: 'Nuraini',
        lptkCode: 'LPTK-MAHATO',
        categoryName: 'Hifzil Qur\'an 1 Juz & Tilawah Putra',
        status: 'VERIFIED',
        photo: photos.maleYoung[0],
        verifierNote: 'Seluruh berkas lengkap dan sesuai kriteria usia.',
      },
      {
        name: 'Aisyah Putri Rahmadani',
        nik: '1406085509100002',
        gender: 'FEMALE',
        birthPlace: 'Mahato',
        birthDate: '2010-09-15',
        address: 'Dusun Sukamaju Desa Mahato',
        phone: '081365112290',
        school: 'MTsN 3 Rokan Hulu',
        father: 'Rahmat Hidayat',
        mother: 'Siti Aminah',
        lptkCode: 'LPTK-MAHATO',
        categoryName: 'Tilawah Anak-Anak Putri',
        status: 'VERIFIED',
        photo: photos.femaleYoung[0],
        verifierNote: 'Surat mandat dan KK sah.',
      },
      {
        name: 'Ahmad Zaki Mubarak',
        nik: '1406082103110003',
        gender: 'MALE',
        birthPlace: 'Pasir Pengaraian',
        birthDate: '2011-03-21',
        address: 'Jl. Pemuda RT 01 Mahato',
        phone: '085278990011',
        school: 'SDN 012 Tambusai Utara',
        father: 'M. Zaini',
        mother: 'Fatimah',
        lptkCode: 'LPTK-MAHATO',
        categoryName: 'Tilawah Anak-Anak Putra',
        status: 'SUBMITTED',
        photo: photos.maleYoung[1],
      },
      {
        name: 'Zahra Nurul Izzah',
        nik: '1406086407060004',
        gender: 'FEMALE',
        birthPlace: 'Mahato',
        birthDate: '2006-07-24',
        address: 'KM 14 Desa Mahato',
        phone: '082170334455',
        school: 'SMAN 2 Tambusai Utara',
        father: 'Drs. H. Marzuki',
        mother: 'Khadijah',
        lptkCode: 'LPTK-MAHATO',
        categoryName: 'Tilawah Remaja Putri',
        status: 'IN_REVIEW',
        photo: photos.femaleYoung[1],
      },
      {
        name: 'Rizki Kurniawan',
        nik: '1406081504000005',
        gender: 'MALE',
        birthPlace: 'Mahato',
        birthDate: '2000-04-15',
        address: 'Dusun Karya Bakti Mahato',
        phone: '081268991122',
        school: 'UIN Suska Riau (Alumni)',
        father: 'H. Suardi',
        mother: 'Rosmawati',
        lptkCode: 'LPTK-MAHATO',
        categoryName: 'Tilawah Dewasa Putra',
        status: 'VERIFIED',
        photo: photos.maleYoung[2],
        verifierNote: 'Lulus verifikasi dewan hakim tingkat kecamatan.',
      },
      {
        name: 'Fathur Rahman Al-Faruq',
        nik: '1406081010070006',
        gender: 'MALE',
        birthPlace: 'Mahato',
        birthDate: '2007-10-10',
        address: 'Jl. Simpang Empat Mahato',
        phone: '085361224488',
        school: 'Pondok Pesantren Darul Ulum',
        father: 'Burhanuddin',
        mother: 'Maryam',
        lptkCode: 'LPTK-MAHATO',
        categoryName: 'Hifzil Qur\'an 5 Juz Putra',
        status: 'REVISION_REQUIRED',
        photo: photos.maleYoung[3],
        verifierNote: 'Pas foto buram dan surat mandat belum distempel basah kepala desa.',
      },

      // 2. Desa Mahato Sakti
      {
        name: 'Bilal Habiburrahman',
        nik: '1406080506090007',
        gender: 'MALE',
        birthPlace: 'Mahato Sakti',
        birthDate: '2009-06-05',
        address: 'Jl. Poros Mahato Sakti RT 03',
        phone: '081371008899',
        school: 'SMPN 4 Tambusai Utara',
        father: 'Habibullah',
        mother: 'Salmah',
        lptkCode: 'LPTK-MAHATO-SAKTI',
        categoryName: 'Hifzil Qur\'an 1 Juz & Tilawah Putra',
        status: 'VERIFIED',
        photo: photos.maleYoung[0],
        verifierNote: 'Berkas valid.',
      },
      {
        name: 'Nabila Syakira',
        nik: '1406085202080008',
        gender: 'FEMALE',
        birthPlace: 'Mahato Sakti',
        birthDate: '2008-02-12',
        address: 'Dusun II Mahato Sakti',
        phone: '085278223344',
        school: 'MTs Al-Falah',
        father: 'Zulkarnaen',
        mother: 'Nurhasanah',
        lptkCode: 'LPTK-MAHATO-SAKTI',
        categoryName: 'Tilawah Remaja Putri',
        status: 'SUBMITTED',
        photo: photos.femaleYoung[2],
      },
      {
        name: 'Daffa Pratama',
        nik: '1406081408040009',
        gender: 'MALE',
        birthPlace: 'Rokan Hulu',
        birthDate: '2004-08-14',
        address: 'Kompleks Pemuda Mahato Sakti',
        phone: '082169550011',
        school: 'Universitas Pasir Pengaraian',
        father: 'Bambang Irawan',
        mother: 'Siti Rahma',
        lptkCode: 'LPTK-MAHATO-SAKTI',
        categoryName: 'Khattil Qur\'an (Kaligrafi)',
        status: 'VERIFIED',
        photo: photos.maleYoung[1],
        verifierNote: 'Karya portfolio dan mandat lengkap.',
      },

      // 3. Desa Bangun Jaya
      {
        name: 'Ibrahim Al-Ghifari',
        nik: '1406081708090010',
        gender: 'MALE',
        birthPlace: 'Bangun Jaya',
        birthDate: '2009-08-17',
        address: 'Jl. Flamboyan Bangun Jaya',
        phone: '081268334499',
        school: 'MTsN 3 Rohul',
        father: 'Ust. Zulkifli',
        mother: 'Aisyah',
        lptkCode: 'LPTK-BANGUN-JAYA',
        categoryName: 'Tilawah Anak-Anak Putra',
        status: 'VERIFIED',
        photo: photos.maleYoung[2],
        verifierNote: 'Validasi akta lahir sesuai syarat usia.',
      },
      {
        name: 'Khairunnisa Humaira',
        nik: '1406084803070011',
        gender: 'FEMALE',
        birthPlace: 'Bangun Jaya',
        birthDate: '2007-03-08',
        address: 'Jl. Melati Bangun Jaya',
        phone: '081375990088',
        school: 'MAS Al-Ikhlas Bangun Jaya',
        father: 'H. Sudirman',
        mother: 'Wartini',
        lptkCode: 'LPTK-BANGUN-JAYA',
        categoryName: 'Hifzil Qur\'an 5 Juz Putri',
        status: 'VERIFIED',
        photo: photos.femaleYoung[3],
        verifierNote: 'Tahfidz 5 juz terkonfirmasi Kemenag Rohul.',
      },
      {
        name: 'M. Hafiz Al-Baqir',
        nik: '1406080301050012',
        gender: 'MALE',
        birthPlace: 'Bangun Jaya',
        birthDate: '2005-01-03',
        address: 'Dusun Bangun Mulya',
        phone: '085271889900',
        school: 'Ponpes Hubbul Wathan',
        father: 'Abdul Somad',
        mother: 'Nurjannah',
        lptkCode: 'LPTK-BANGUN-JAYA',
        categoryName: 'Tilawah Remaja Putra',
        status: 'IN_REVIEW',
        photo: photos.maleYoung[3],
      },
      {
        name: 'Regu Fahmil Bangun Jaya',
        nik: '1406082005070013',
        gender: 'MALE',
        birthPlace: 'Bangun Jaya',
        birthDate: '2007-05-20',
        address: 'Jl. Pendidikan Bangun Jaya',
        phone: '082169112244',
        school: 'Gabungan Pelajar Bangun Jaya',
        father: 'Drs. H. Syarif',
        mother: 'Faridah',
        lptkCode: 'LPTK-BANGUN-JAYA',
        categoryName: 'Fahmil Qur\'an (Cerdas Cermat)',
        status: 'SUBMITTED',
        photo: photos.maleYoung[0],
      },

      // 4. Desa Tambusai Utara
      {
        name: 'Umar Abdullah',
        nik: '1406081111980014',
        gender: 'MALE',
        birthPlace: 'Tambusai Utara',
        birthDate: '1998-11-11',
        address: 'Jl. Lingkar Desa Tambusai Utara',
        phone: '081270998877',
        school: 'STAI Pasir Pengaraian',
        father: 'H. Abdullah',
        mother: 'Halimah',
        lptkCode: 'LPTK-TAMBUSAI-UTARA',
        categoryName: 'Tilawah Dewasa Putra',
        status: 'VERIFIED',
        photo: photos.maleYoung[1],
        verifierNote: 'Juara 2 tahun lalu, berkas verified.',
      },
      {
        name: 'Nur Azizah Siregar',
        nik: '1406085012990015',
        gender: 'FEMALE',
        birthPlace: 'Tambusai Utara',
        birthDate: '1999-12-10',
        address: 'Jl. Pemuda Tambusai Utara',
        phone: '081365443322',
        school: 'IAIN Padangsidimpuan',
        father: 'Maragading Siregar',
        mother: 'Siti Kholijah',
        lptkCode: 'LPTK-TAMBUSAI-UTARA',
        categoryName: 'Tilawah Dewasa Putri',
        status: 'VERIFIED',
        photo: photos.femaleYoung[0],
        verifierNote: 'Lengkap dan sah.',
      },
      {
        name: 'Muhammad Rayhan',
        nik: '1406082506120016',
        gender: 'MALE',
        birthPlace: 'Tambusai Utara',
        birthDate: '2012-06-25',
        address: 'Dusun Kota Lama Tambusai Utara',
        phone: '085265112288',
        school: 'SDN 005 Tambusai Utara',
        father: 'Rudi Hartono',
        mother: 'Eka Susanti',
        lptkCode: 'LPTK-TAMBUSAI-UTARA',
        categoryName: 'Tilawah Anak-Anak Putra',
        status: 'REJECTED',
        photo: photos.maleYoung[2],
        verifierNote: 'NIK tidak terdaftar di Disdukcapil Rokan Hulu dan domisili luar kecamatan.',
      },

      // 5. Desa Rantau Sakti
      {
        name: 'Hasan Basri',
        nik: '1406080909060017',
        gender: 'MALE',
        birthPlace: 'Rantau Sakti',
        birthDate: '2006-09-09',
        address: 'Jl. Sawit KM 4 Rantau Sakti',
        phone: '082170889911',
        school: 'SMK Negeri 1 Rantau Sakti',
        father: 'Basirun',
        mother: 'Sumarni',
        lptkCode: 'LPTK-RANTAU-SAKTI',
        categoryName: 'Tilawah Remaja Putra',
        status: 'VERIFIED',
        photo: photos.maleYoung[3],
        verifierNote: 'Berkas lengkap.',
      },
      {
        name: 'Fatimah Az-Zahra',
        nik: '1406084101110018',
        gender: 'FEMALE',
        birthPlace: 'Rantau Sakti',
        birthDate: '2011-01-01',
        address: 'Kompleks PLTBg Rantau Sakti',
        phone: '081268554433',
        school: 'SDN 008 Rantau Sakti',
        father: 'Ir. Hendra',
        mother: 'Nurul Hidayati',
        lptkCode: 'LPTK-RANTAU-SAKTI',
        categoryName: 'Tilawah Anak-Anak Putri',
        status: 'SUBMITTED',
        photo: photos.femaleYoung[1],
      },
      {
        name: 'Regu Syarhil Rantau Sakti',
        nik: '1406081804070019',
        gender: 'FEMALE',
        birthPlace: 'Rantau Sakti',
        birthDate: '2007-04-18',
        address: 'Jl. Utama Rantau Sakti',
        phone: '081375221144',
        school: 'SMA Swasta Rantau Sakti',
        father: 'H. Marzuki',
        mother: 'Zubaidah',
        lptkCode: 'LPTK-RANTAU-SAKTI',
        categoryName: 'Syarhil Qur\'an (Pidato)',
        status: 'VERIFIED',
        photo: photos.femaleYoung[2],
        verifierNote: 'Naskah teks pidato dan susunan regu valid.',
      },

      // 6. Desa Pagar Mayang
      {
        name: 'Yusuf Mansur Harahap',
        nik: '1406082207080020',
        gender: 'MALE',
        birthPlace: 'Pagar Mayang',
        birthDate: '2008-07-22',
        address: 'Dusun Suka Makmur Pagar Mayang',
        phone: '085278443322',
        school: 'MTs Pagar Mayang',
        father: 'Mansur Harahap',
        mother: 'Ratna Dewi',
        lptkCode: 'LPTK-PAGAR-MAYANG',
        categoryName: 'Hifzil Qur\'an 1 Juz & Tilawah Putra',
        status: 'VERIFIED',
        photo: photos.maleYoung[0],
        verifierNote: 'Lulus administrasi berkas.',
      },
      {
        name: 'Siti Maryam Hasibuan',
        nik: '1406086010050021',
        gender: 'FEMALE',
        birthPlace: 'Pagar Mayang',
        birthDate: '2005-10-20',
        address: 'Jl. Masjid Raya Pagar Mayang',
        phone: '082169778899',
        school: 'SMAN 1 Tambusai Utara',
        father: 'H. Ismail Hasan',
        mother: 'Mardiah',
        lptkCode: 'LPTK-PAGAR-MAYANG',
        categoryName: 'Tilawah Remaja Putri',
        status: 'SUBMITTED',
        photo: photos.femaleYoung[3],
      },

      // 7. Desa Simpang Harapan
      {
        name: 'Ali Imran Tanjung',
        nik: '1406081402090022',
        gender: 'MALE',
        birthPlace: 'Simpang Harapan',
        birthDate: '2009-02-14',
        address: 'Jl. Dahlia Simpang Harapan',
        phone: '081268112233',
        school: 'SMP Negeri 5 Tambusai Utara',
        father: 'M. Tanjung',
        mother: 'Salmiah',
        lptkCode: 'LPTK-SIMPANG-HARAPAN',
        categoryName: 'Tilawah Anak-Anak Putra',
        status: 'DRAFT',
        photo: photos.maleYoung[1],
      },
      {
        name: 'Annisa Rahmawati',
        nik: '1406085505080023',
        gender: 'FEMALE',
        birthPlace: 'Simpang Harapan',
        birthDate: '2008-05-15',
        address: 'Blok C Simpang Harapan',
        phone: '081371990011',
        school: 'MTs Simpang Harapan',
        father: 'H. Syamsuddin',
        mother: 'Nurlela',
        lptkCode: 'LPTK-SIMPANG-HARAPAN',
        categoryName: 'Hifzil Qur\'an 1 Juz & Tilawah Putri',
        status: 'VERIFIED',
        photo: photos.femaleYoung[0],
        verifierNote: 'Kafilah resmi Simpang Harapan.',
      },

      // 8. Desa Suka Damai
      {
        name: 'Bahrul Ulum',
        nik: '1406081909010024',
        gender: 'MALE',
        birthPlace: 'Suka Damai',
        birthDate: '2001-09-19',
        address: 'Dusun Karang Anyar Suka Damai',
        phone: '085278665544',
        school: 'Universitas Riau (Mahasiswa)',
        father: 'Ust. Nurhadi',
        mother: 'Sulastri',
        lptkCode: 'LPTK-SUKA-DAMAI',
        categoryName: 'Khattil Qur\'an (Kaligrafi)',
        status: 'VERIFIED',
        photo: photos.maleYoung[2],
        verifierNote: 'Berkas kaligrafi dan KTP Rohul terverifikasi.',
      },
      {
        name: 'Mawaddah Warahmah',
        nik: '1406084408100025',
        gender: 'FEMALE',
        birthPlace: 'Suka Damai',
        birthDate: '2010-08-04',
        address: 'Jl. Poros Suka Damai',
        phone: '082170223388',
        school: 'SDN Suka Damai',
        father: 'H. Wagimin',
        mother: 'Sriyatun',
        lptkCode: 'LPTK-SUKA-DAMAI',
        categoryName: 'Tilawah Anak-Anak Putri',
        status: 'SUBMITTED',
        photo: photos.femaleYoung[1],
      },

      // 9. Desa Mekar Jaya
      {
        name: 'Thoriq Aziz',
        nik: '1406081606060026',
        gender: 'MALE',
        birthPlace: 'Mekar Jaya',
        birthDate: '2006-06-16',
        address: 'Jl. Trans Mekar Jaya Blok A',
        phone: '081268997755',
        school: 'SMKN Tambusai Utara',
        father: 'Drs. H. Abdul Malik',
        mother: 'Rohana',
        lptkCode: 'LPTK-MEKAR-JAYA',
        categoryName: 'Tilawah Remaja Putra',
        status: 'VERIFIED',
        photo: photos.maleYoung[3],
        verifierNote: 'Sah sebagai perwakilan Mekar Jaya.',
      },

      // 10. Desa Payung Sekaki
      {
        name: 'Salma Salsabila',
        nik: '1406085112070027',
        gender: 'FEMALE',
        birthPlace: 'Payung Sekaki',
        birthDate: '2007-12-11',
        address: 'Jl. Koperasi Payung Sekaki',
        phone: '081375887766',
        school: 'MAS Payung Sekaki',
        father: 'H. Burhanuddin',
        mother: 'Fauziah',
        lptkCode: 'LPTK-PAYUNG-SEKAKI',
        categoryName: 'Tilawah Remaja Putri',
        status: 'VERIFIED',
        photo: photos.femaleYoung[2],
        verifierNote: 'Surat mandat desa sah.',
      },
      {
        name: 'Ilyas Saputra',
        nik: '1406080203090028',
        gender: 'MALE',
        birthPlace: 'Payung Sekaki',
        birthDate: '2009-03-02',
        address: 'RT 01 Payung Sekaki',
        phone: '085271449900',
        school: 'MTs Al-Mujahidin',
        father: 'Saputra',
        mother: 'Nurbaiti',
        lptkCode: 'LPTK-PAYUNG-SEKAKI',
        categoryName: 'Hifzil Qur\'an 1 Juz & Tilawah Putra',
        status: 'IN_REVIEW',
        photo: photos.maleYoung[0],
      },
    ];

    const defaultCreatorId = userMap['eka.ckp16799@gmail.com'];
    const verifierId = userMap['kecamatan.mahato@rohul.go.id'];

    let seededCount = 0;
    for (const p of participantsData) {
      const lptkId = lptkMap[p.lptkCode];
      const categoryId = categoryMap[p.categoryName];

      if (!lptkId || !categoryId) {
        console.warn(`Skipping ${p.name}: missing lptk or category`);
        continue;
      }

      // Check if participant already exists by NIK
      const existing = await sql`SELECT id FROM public.participants WHERE nik = ${p.nik} LIMIT 1`;
      let participantId;

      if (existing.length > 0) {
        participantId = existing[0].id;
        await sql`
          UPDATE public.participants SET
            name = ${p.name},
            lptk_id = ${lptkId},
            competition_id = ${mainCompId},
            gender_code = ${p.gender},
            birth_place = ${p.birthPlace},
            birth_date = ${p.birthDate},
            address = ${p.address},
            phone = ${p.phone},
            school_or_institution = ${p.school},
            father_name = ${p.father},
            mother_name = ${p.mother},
            status_code = ${p.status},
            rejection_note = ${p.verifierNote || null},
            photo_url = ${p.photo},
            deleted_at = NULL
          WHERE id = ${participantId};
        `;
      } else {
        const [inserted] = await sql`
          INSERT INTO public.participants (
            competition_id, lptk_id, name, nik, gender_code, birth_place, birth_date,
            address, phone, school_or_institution, father_name, mother_name,
            status_code, rejection_note, photo_url, created_by, submitted_at
          ) VALUES (
            ${mainCompId}, ${lptkId}, ${p.name}, ${p.nik}, ${p.gender}, ${p.birthPlace}, ${p.birthDate},
            ${p.address}, ${p.phone}, ${p.school}, ${p.father}, ${p.mother},
            ${p.status}, ${p.verifierNote || null}, ${p.photo}, ${defaultCreatorId},
            ${p.status !== 'DRAFT' ? new Date().toISOString() : null}
          )
          RETURNING id;
        `;
        participantId = inserted.id;
      }

      // Link participant to category
      await sql`
        INSERT INTO public.participant_categories (participant_id, category_id)
        VALUES (${participantId}, ${categoryId})
        ON CONFLICT (participant_id, category_id) DO NOTHING;
      `;

      // If status is VERIFIED / REJECTED / REVISION_REQUIRED, create verification log
      if (['VERIFIED', 'REJECTED', 'REVISION_REQUIRED'].includes(p.status) && verifierId) {
        await sql`
          INSERT INTO public.verifications (participant_id, verifier_id, decision, note)
          VALUES (${participantId}, ${verifierId}, ${p.status}, ${p.verifierNote || 'Keputusan verifikator'});
        `;
      }

      seededCount++;
    }

    console.log(`✅ Seeding Mahato completed!`);
    console.log(`  - 10 Desa di Tambusai Utara / Mahato`);
    console.log(`  - 10 LPTK Desa`);
    console.log(`  - 4 Pengguna (Super Admin, Admin Kecamatan, 2 Operator Desa)`);
    console.log(`  - 2 Lomba MTQ/STQ 2026`);
    console.log(`  - 8 Cabang Kategori Lomba`);
    console.log(`  - ${seededCount} Peserta Lengkap dengan Foto & Status`);

  } catch (err) {
    console.error('❌ Seeding Mahato failed:', err);
    process.exit(1);
  }
}

seedMahato();
