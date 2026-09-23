'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { History, Search, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PaginationBar } from '@/components/ui/pagination';
import { AuditLog } from '@/types/database';
import { PaginationMeta } from '@/types/api';

export default function AuditLogsPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionCode, setActionCode] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      if (search) params.set('q', search);
      if (actionCode) params.set('action_code', actionCode);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
          setMeta(json.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionCode]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Audit</h1>
          <p className="text-xs text-neutral-500">Jejak rekaman aktivitas dan perubahan data sistem</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari aksi, pengguna, atau entitas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black"
          />
        </div>

        <select
          value={actionCode}
          onChange={(e) => {
            setActionCode(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-black font-mono"
        >
          <option value="">Semua Aksi</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="CREATE_PARTICIPANT">CREATE_PARTICIPANT</option>
          <option value="UPDATE_PARTICIPANT">UPDATE_PARTICIPANT</option>
          <option value="SUBMIT_PARTICIPANT">SUBMIT_PARTICIPANT</option>
          <option value="VERIFY_VERIFIED">VERIFY_VERIFIED</option>
          <option value="VERIFY_REVISION_REQUIRED">VERIFY_REVISION_REQUIRED</option>
          <option value="VERIFY_REJECTED">VERIFY_REJECTED</option>
          <option value="UPLOAD_DOCUMENT">UPLOAD_DOCUMENT</option>
          <option value="DELETE_DOCUMENT">DELETE_DOCUMENT</option>
        </select>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Memuat catatan audit...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded">
          Tidak ada catatan audit yang cocok.
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Waktu</th>
                  <th className="px-4 py-2.5">Pengguna</th>
                  <th className="px-4 py-2.5">Aksi</th>
                  <th className="px-4 py-2.5">Entitas</th>
                  <th className="px-4 py-2.5">IP Address</th>
                  <th className="w-16 px-4 py-2.5 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-black">{log.user_name || 'Sistem'}</div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-black">
                      {log.action_code}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5"
                        aria-label="Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar meta={meta} onPageChange={setPage} />
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detail Audit Log"
      >
        {selectedLog && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 border-b border-neutral-200 pb-2">
              <div>
                <span className="text-neutral-500 block text-[10px]">Aksi</span>
                <span className="font-mono font-bold text-black">{selectedLog.action_code}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Entitas</span>
                <span className="font-mono text-black">{selectedLog.entity_type} ({selectedLog.entity_id || '-'})</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Pengguna</span>
                <span className="text-black">{selectedLog.user_name}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Waktu</span>
                <span className="font-mono text-neutral-600">{new Date(selectedLog.created_at).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {selectedLog.old_data && (
              <div>
                <span className="text-neutral-500 block text-[10px] mb-1">Data Sebelum:</span>
                <pre className="p-2 bg-neutral-100 border border-neutral-300 rounded font-mono text-[10px] max-h-36 overflow-auto">
                  {JSON.stringify(selectedLog.old_data, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.new_data && (
              <div>
                <span className="text-neutral-500 block text-[10px] mb-1">Data Sesudah:</span>
                <pre className="p-2 bg-neutral-100 border border-neutral-300 rounded font-mono text-[10px] max-h-36 overflow-auto">
                  {JSON.stringify(selectedLog.new_data, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <Button size="sm" onClick={() => setSelectedLog(null)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
