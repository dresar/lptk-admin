'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Key, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Role, Permission } from '@/types/database';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Permission Modal
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [assignedPermIds, setAssignedPermIds] = useState<string[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [permSaving, setPermSaving] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRoles(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // Load all permissions
    fetch('/api/admin/permissions')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAllPermissions(json.data);
      });
  }, []);

  const handleOpenPermissions = async (role: Role) => {
    setSelectedRole(role);
    setPermLoading(true);
    try {
      const res = await fetch(`/api/admin/roles/${role.id}/permissions`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAssignedPermIds(json.data.map((p: any) => p.id));
        }
      }
    } catch (err) {
      console.error('Failed to load role permissions:', err);
    } finally {
      setPermLoading(false);
    }
  };

  const handleTogglePermission = (id: string) => {
    setAssignedPermIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setPermSaving(true);
    try {
      const res = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission_ids: assignedPermIds }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedRole(null);
        fetchRoles();
      }
    } catch (err) {
      alert('Gagal menyimpan hak akses.');
    } finally {
      setPermSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Peran</h1>
          <p className="text-xs text-neutral-500">Peran pengguna dan matriks hak akses sistem</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500">Memuat peran...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white border border-neutral-300 rounded p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    {role.code}
                  </span>
                  {role.is_system && (
                    <span className="text-[10px] font-mono text-neutral-400">SISTEM</span>
                  )}
                </div>
                <h3 className="font-bold text-base text-black mb-1">{role.name}</h3>
                <p className="text-xs text-neutral-500 mb-4">{role.description || '-'}</p>

                <div className="text-xs text-neutral-600 space-y-1 py-2 border-t border-neutral-100 font-mono">
                  <div>Hak Akses: {role.permissions_count || 0} izin</div>
                  <div>Pengguna: {role.users_count || 0} akun</div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenPermissions(role)}
                  className="text-xs gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  Akses
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permissions Modal */}
      <Modal
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title={`Hak Akses: ${selectedRole?.name}`}
      >
        <div className="space-y-4">
          {permLoading ? (
            <div className="p-4 text-xs text-neutral-500 text-center">Memuat daftar izin...</div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-1.5 p-1">
              {allPermissions.map((perm) => {
                const isChecked = assignedPermIds.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className={`flex items-center justify-between p-2 rounded border text-xs cursor-pointer ${
                      isChecked ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-black">{perm.name}</div>
                      <div className="font-mono text-[10px] text-neutral-500">{perm.code}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(perm.id)}
                      className="rounded border-neutral-300"
                    />
                  </label>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRole(null)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              isLoading={permSaving}
              onClick={handleSavePermissions}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
