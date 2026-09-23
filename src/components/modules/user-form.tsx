'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserAccount, Role, Lptk } from '@/types/database';

export interface UserFormProps {
  initialData?: UserAccount | null;
}

export function UserForm({ initialData }: UserFormProps) {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [lptks, setLptks] = useState<Lptk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    password: '',
    role_id: initialData?.role_id || '',
    lptk_id: initialData?.lptk_id || '',
    active: initialData?.active ?? true,
    must_change_password: initialData?.must_change_password ?? false,
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch('/api/admin/meta/options');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setRoles(json.data.roles || []);
            setLptks(json.data.lptks || []);
            if (!formData.role_id && json.data.roles?.length > 0) {
              setFormData((prev) => ({ ...prev, role_id: json.data.roles[0].id }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load options:', err);
      }
    }
    loadOptions();
  }, [formData.role_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isEdit = !!initialData?.id;
    const url = isEdit ? `/api/admin/users/${initialData.id}` : '/api/admin/users';
    const method = isEdit ? 'PATCH' : 'POST';

    const payload: any = {
      full_name: formData.full_name,
      email: formData.email,
      role_id: formData.role_id,
      lptk_id: formData.lptk_id || null,
      active: formData.active,
      must_change_password: formData.must_change_password,
    };

    if (!isEdit && formData.password) {
      payload.password = formData.password;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Gagal menyimpan data pengguna.');
        setLoading(false);
        return;
      }

      router.push('/admin/users');
      router.refresh();
    } catch (err) {
      setError('Terjadi kendala jaringan saat menghubungi server.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white border border-neutral-300 rounded p-6 space-y-4">
      {error && (
        <div className="p-3 text-xs bg-neutral-100 border border-neutral-400 text-black rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-black mb-1">Nama Lengkap</label>
        <input
          type="text"
          required
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="Nama administrator / operator"
          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@mail.com"
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          />
        </div>

        {!initialData && (
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Sandi Awal</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Kosongkan untuk bawaan (password123)"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Peran Akun</label>
          <select
            required
            value={formData.role_id}
            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          >
            <option value="">Pilih Peran</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">LPTK Asal (Khusus Operator)</label>
          <select
            value={formData.lptk_id}
            onChange={(e) => setFormData({ ...formData, lptk_id: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
          >
            <option value="">Tidak Terikat (Admin)</option>
            {lptks.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="user-active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded border-neutral-300"
          />
          <label htmlFor="user-active" className="text-xs font-medium text-black">
            Status Aktif
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="must-change-pass"
            checked={formData.must_change_password}
            onChange={(e) => setFormData({ ...formData, must_change_password: e.target.checked })}
            className="rounded border-neutral-300"
          />
          <label htmlFor="must-change-pass" className="text-xs font-medium text-black">
            Wajib Ganti Sandi Saat Masuk
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/users')}
        >
          Batal
        </Button>
        <Button type="submit" size="sm" isLoading={loading}>
          Simpan
        </Button>
      </div>
    </form>
  );
}
