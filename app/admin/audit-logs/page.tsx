'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AuditLog, SafeUser } from '@/lib/types';
import { ShieldAlert, Search, Filter, Clock, User, HardDrive, Terminal } from 'lucide-react';

export default function AuditLogsPage() {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  const fetchLogs = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      setCurrentUser(uData.user);

      const params = new URLSearchParams();
      if (selectedModule) params.append('module', selectedModule);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedModule]);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const details = `${log.old_value || ''} ${log.new_value || ''}`;
    return (
      log.user_name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      details.toLowerCase().includes(q) ||
      log.ip_address.includes(q)
    );
  });

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <span>Audit Trail & Log Aktivitas Sistem</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekam jejak digital terenkripsi seluruh tindakan administratif, perubahan status, dan interaksi pengguna
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari user, aksi, detail perubahan, atau IP address..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium"
          >
            <option value="">Semua Modul</option>
            <option value="AUTH">AUTH (Login / Register)</option>
            <option value="COMPLAINTS">COMPLAINTS (Pengaduan & Status)</option>
            <option value="ANNOUNCEMENTS">ANNOUNCEMENTS (Pengumuman)</option>
            <option value="USERS">USERS (Pengguna & Hak Akses)</option>
            <option value="REGIONS">REGIONS (Wilayah RW/RT)</option>
            <option value="SYSTEM">SYSTEM (Konfigurasi)</option>
          </select>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Waktu Kejadian</th>
                  <th className="px-5 py-3.5">Pengguna & Peran</th>
                  <th className="px-5 py-3.5">Modul & Aksi</th>
                  <th className="px-5 py-3.5">Rincian Perubahan</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                      Memuat rekaman log...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                      Tidak ada rekaman log audit yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-900 font-sans block">
                          {log.user_name}
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          {log.user_role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 block w-fit mb-0.5">
                          {log.module}
                        </span>
                        <span className="text-slate-900 font-sans text-xs">{log.action}</span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 font-sans max-w-xs break-words text-[11px]">
                        {log.new_value || log.old_value || '-'}
                      </td>

                      <td className="px-5 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
