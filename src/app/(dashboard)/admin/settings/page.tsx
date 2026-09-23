'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSettings(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleValueChange = (key: string, value: any) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = settings.map((s) => ({
      key: s.key,
      value: s.value,
    }));

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage('Pengaturan sistem berhasil disimpan.');
      } else {
        setMessage(json.error?.message || 'Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      setMessage('Terjadi kendala jaringan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Pengaturan</h1>
          <p className="text-xs text-neutral-500">Konfigurasi operasional dan keamanan sistem</p>
        </div>
      </div>

      {message && (
        <div className="p-3 text-xs bg-neutral-100 border border-neutral-400 text-black rounded">
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500">Memuat konfigurasi...</div>
      ) : (
        <form onSubmit={handleSave} className="max-w-2xl bg-white border border-neutral-300 rounded p-6 space-y-4">
          {settings.map((item) => (
            <div key={item.key} className="space-y-1 pb-3 border-b border-neutral-100 last:border-0">
              <label className="block text-xs font-semibold text-black">
                {item.key}
              </label>
              <p className="text-[11px] text-neutral-500 mb-1">{item.description}</p>

              {typeof item.value === 'boolean' ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={item.value}
                    onChange={(e) => handleValueChange(item.key, e.target.checked)}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-xs text-black">{item.value ? 'Aktif' : 'Nonaktif'}</span>
                </div>
              ) : Array.isArray(item.value) ? (
                <input
                  type="text"
                  value={item.value.join(', ')}
                  onChange={(e) =>
                    handleValueChange(
                      item.key,
                      e.target.value.split(',').map((x) => x.trim())
                    )
                  }
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
                />
              ) : (
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleValueChange(item.key, e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-black font-mono"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end pt-3">
            {/* 1-Word Button: Simpan */}
            <Button type="submit" size="sm" isLoading={saving} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              Simpan
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
