import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

async function runSeed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not defined in environment variables.');
    process.exit(1);
  }

  console.log('Seeding initial system data in Neon PostgreSQL...');
  const sql = neon(databaseUrl);

  try {
    // 1. Seed Roles
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

    // 2. Seed Permissions
    const permissions = [
      // Dashboard
      { code: 'dashboard.read', group: 'dashboard', name: 'Lihat Dashboard' },
      // Desa
      { code: 'village.read', group: 'village', name: 'Lihat Desa' },
      { code: 'village.write', group: 'village', name: 'Kelola Desa' },
      // LPTK
      { code: 'lptk.read', group: 'lptk', name: 'Lihat LPTK' },
      { code: 'lptk.write', group: 'lptk', name: 'Kelola LPTK' },
      // User
      { code: 'user.read', group: 'user', name: 'Lihat Pengguna' },
      { code: 'user.write', group: 'user', name: 'Kelola Pengguna' },
      // Role & Permission
      { code: 'role.read', group: 'role', name: 'Lihat Peran' },
      { code: 'role.write', group: 'role', name: 'Kelola Peran' },
      { code: 'permission.read', group: 'permission', name: 'Lihat Hak Akses' },
      // Lomba
      { code: 'competition.read', group: 'competition', name: 'Lihat Lomba' },
      { code: 'competition.write', group: 'competition', name: 'Kelola Lomba' },
      // Kategori
      { code: 'category.read', group: 'category', name: 'Lihat Kategori' },
      { code: 'category.write', group: 'category', name: 'Kelola Kategori' },
      // Jenis Dokumen
      { code: 'document_type.read', group: 'document_type', name: 'Lihat Jenis Dokumen' },
      { code: 'document_type.write', group: 'document_type', name: 'Kelola Jenis Dokumen' },
      // Peserta
      { code: 'participant.read', group: 'participant', name: 'Lihat Peserta' },
      { code: 'participant.write', group: 'participant', name: 'Kelola Peserta' },
      { code: 'participant.submit', group: 'participant', name: 'Submit Peserta' },
      // Dokumen
      { code: 'document.read', group: 'document', name: 'Lihat Dokumen' },
      { code: 'document.write', group: 'document', name: 'Unggah Dokumen' },
      { code: 'document.download', group: 'document', name: 'Unduh Dokumen' },
      { code: 'document.delete', group: 'document', name: 'Hapus Dokumen' },
      // Verifikasi
      { code: 'verification.read', group: 'verification', name: 'Lihat Verifikasi' },
      { code: 'verification.decide', group: 'verification', name: 'Putuskan Verifikasi' },
      // Laporan
      { code: 'report.read', group: 'report', name: 'Lihat Laporan' },
      { code: 'report.export', group: 'report', name: 'Ekspor Laporan' },
      // Audit Log
      { code: 'audit.read', group: 'audit', name: 'Lihat Audit Log' },
      // Pengaturan
      { code: 'setting.read', group: 'setting', name: 'Lihat Pengaturan' },
      { code: 'setting.write', group: 'setting', name: 'Kelola Pengaturan' },
      // CDN
      { code: 'cdn.read', group: 'cdn', name: 'Lihat CDN Asset' },
      { code: 'cdn.write', group: 'cdn', name: 'Kelola CDN Asset' }
    ];

    for (const p of permissions) {
      await sql`
        INSERT INTO auth.permissions (code, group_name, name)
        VALUES (${p.code}, ${p.group}, ${p.name})
        ON CONFLICT (code) DO UPDATE SET group_name = ${p.group}, name = ${p.name};
      `;
    }

    // 3. Bind All Permissions to SUPER_ADMIN
    const [superAdminRole] = await sql`SELECT id FROM auth.roles WHERE code = 'SUPER_ADMIN'`;
    const allPermissions = await sql`SELECT id FROM auth.permissions`;

    for (const perm of allPermissions) {
      await sql`
        INSERT INTO auth.role_permissions (role_id, permission_id)
        VALUES (${superAdminRole.id}, ${perm.id})
        ON CONFLICT DO NOTHING;
      `;
    }

    // Bind Kecamatan Permissions
    const [kecamatanRole] = await sql`SELECT id FROM auth.roles WHERE code = 'ADMIN_KECAMATAN'`;
    const kecamatanPermCodes = [
      'dashboard.read', 'village.read', 'lptk.read', 'lptk.write',
      'user.read', 'competition.read', 'competition.write',
      'category.read', 'category.write', 'document_type.read',
      'participant.read', 'participant.write',
      'document.read', 'document.download',
      'verification.read', 'verification.decide',
      'report.read', 'report.export', 'audit.read',
      'setting.read', 'cdn.read'
    ];
    for (const code of kecamatanPermCodes) {
      const [perm] = await sql`SELECT id FROM auth.permissions WHERE code = ${code}`;
      if (perm) {
        await sql`
          INSERT INTO auth.role_permissions (role_id, permission_id)
          VALUES (${kecamatanRole.id}, ${perm.id})
          ON CONFLICT DO NOTHING;
        `;
      }
    }

    // Bind Operator Permissions
    const [operatorRole] = await sql`SELECT id FROM auth.roles WHERE code = 'OPERATOR_LPTK'`;
    const operatorPermCodes = [
      'dashboard.read', 'lptk.read', 'competition.read', 'category.read',
      'participant.read', 'participant.write', 'participant.submit',
      'document.read', 'document.write', 'document.download', 'document.delete',
      'verification.read', 'report.read', 'report.export'
    ];
    for (const code of operatorPermCodes) {
      const [perm] = await sql`SELECT id FROM auth.permissions WHERE code = ${code}`;
      if (perm) {
        await sql`
          INSERT INTO auth.role_permissions (role_id, permission_id)
          VALUES (${operatorRole.id}, ${perm.id})
          ON CONFLICT DO NOTHING;
        `;
      }
    }

    // 4. Create Default Super Admin Account
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await sql`
      INSERT INTO auth.users (email, password_hash, full_name, role_id, active, must_change_password)
      VALUES ('admin@mail.com', ${passwordHash}, 'Super Administrator', ${superAdminRole.id}, true, false)
      ON CONFLICT (email) DO NOTHING;
    `;

    // 4b. Create Primary Admin Account (eka)
    const ekaPasswordHash = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO auth.users (email, password_hash, full_name, role_id, active, must_change_password)
      VALUES ('eka.ckp16799@gmail.com', ${ekaPasswordHash}, 'Eka Syarif Maulana', ${superAdminRole.id}, true, false)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${ekaPasswordHash},
        full_name = 'Eka Syarif Maulana',
        role_id = ${superAdminRole.id},
        active = true;
    `;

    // 5. Seed Default Document Types
    const documentTypes = [
      { code: 'KTP', name: 'KTP / Kartu Identitas', is_required: true },
      { code: 'KK', name: 'Kartu Keluarga (KK)', is_required: true },
      { code: 'PAS_FOTO', name: 'Pas Foto Resmi (3x4)', is_required: true },
      { code: 'SURAT_MANDAT', name: 'Surat Mandat Desa / LPTK', is_required: true },
      { code: 'IJAZAH_AKTA', name: 'Ijazah / Akta Kelahiran', is_required: true },
    ];

    for (const dt of documentTypes) {
      await sql`
        INSERT INTO public.document_types (code, name, is_required, active)
        VALUES (${dt.code}, ${dt.name}, ${dt.is_required}, true)
        ON CONFLICT (code) DO UPDATE SET name = ${dt.name}, is_required = ${dt.is_required};
      `;
    }

    // 6. Seed Default System Settings
    const defaultSettings = [
      { key: 'max_upload_size_mb', value: 5, description: 'Batas maksimum ukuran file dalam Megabyte' },
      { key: 'allowed_mime_types', value: ['application/pdf', 'image/jpeg', 'image/png'], description: 'MIME types yang diizinkan' },
      { key: 'system_maintenance', value: false, description: 'Mode pemeliharaan sistem' },
      { key: 'session_idle_timeout_minutes', value: 30, description: 'Batas waktu inaktif sesi pengguna (menit)' },
      { key: 'session_absolute_timeout_hours', value: 12, description: 'Batas masa hidup mutlak sesi pengguna (jam)' },
    ];

    for (const s of defaultSettings) {
      await sql`
        INSERT INTO public.system_settings (key, value, description)
        VALUES (${s.key}, ${JSON.stringify(s.value)}, ${s.description})
        ON CONFLICT (key) DO UPDATE SET description = ${s.description};
      `;
    }

    console.log('✅ Seeding completed successfully!');
    console.log('👤 Default Account: admin@mail.com / password123');
    console.log('👤 Primary Account: eka.ckp16799@gmail.com / admin123');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

runSeed();
