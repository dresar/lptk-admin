'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Building2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/profile');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setProfile(json.data);
            setFullName(json.data.full_name || '');
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validate passwords if user wants to change
    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg('Sandi saat ini wajib diisi jika ingin mengganti kata sandi.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('Kata sandi baru minimal 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        full_name: fullName.trim(),
      };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Gagal memperbarui profil.');
        return;
      }

      setSuccessMsg('Profil dan data akun berhasil disimpan.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (json.data?.user) {
        setProfile((prev: any) => ({ ...prev, full_name: json.data.user.full_name }));
      }
    } catch {
      setErrorMsg('Terjadi kendala jaringan saat menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-black tracking-tight uppercase">Profil Akun</h1>
        <p className="text-xs text-neutral-500">Kelola identitas akun dan keamanan sandi</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-400 bg-white border border-neutral-200 rounded">
          Memuat data profil...
        </div>
      ) : profile ? (
        <div className="space-y-4">
          {/* Identity Overview Card */}
          <div className="bg-white border border-neutral-300 rounded p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg shadow-sm border border-neutral-700">
                {initials}
              </div>
              <div>
                <h2 className="text-base font-bold text-black leading-tight">
                  {profile.full_name}
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wide uppercase bg-black text-white font-semibold">
                    <Shield className="w-3 h-3" />
                    {profile.role_code.replace(/_/g, ' ')}
                  </span>
                  {profile.lptk_name && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-100 text-neutral-700 border border-neutral-300">
                      <Building2 className="w-3 h-3" />
                      {profile.lptk_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {profile.village_name && (
              <div className="text-left sm:text-right text-xs text-neutral-600 font-mono">
                <div>Wilayah: {profile.village_name}</div>
                <div className="text-[10px] text-neutral-400">Tambusai Utara, Rohul</div>
              </div>
            )}
          </div>

          {/* Alert Feedback */}
          {successMsg && (
            <div className="p-3 bg-neutral-100 border border-black text-black text-xs rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-neutral-100 border border-neutral-400 text-black text-xs rounded flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-black flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSave} className="bg-white border border-neutral-300 rounded p-4 sm:p-5 space-y-5 shadow-sm">
            {/* Account Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-1.5">
                Data Identitas
              </h3>

              <div>
                <label className="block text-xs font-semibold text-black mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1 flex items-center justify-between">
                  <span>Alamat Email</span>
                  <span className="text-[10px] text-neutral-400 font-normal">(Terkunci oleh sistem)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded bg-neutral-100 text-neutral-500 cursor-not-allowed select-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  * Alamat email tidak dapat diubah demi menjaga integritas data login dan audit sistem.
                </p>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-1.5 flex items-center justify-between">
                <span>Keamanan Sandi</span>
                <span className="text-[10px] text-neutral-400 font-normal">Kosongkan jika tidak ingin ganti</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-black mb-1">
                  Sandi Saat Ini
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Konfirmasi Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi sandi baru"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button 1 Word: Simpan */}
            <div className="flex justify-end pt-3 border-t border-neutral-200">
              <Button type="submit" isLoading={saving} className="px-5 font-bold">
                Simpan
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
