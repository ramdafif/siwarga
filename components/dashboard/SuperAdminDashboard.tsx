'use client';

import React from 'react';
import Link from 'next/link';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building2,
  ShieldAlert,
  Settings,
  TrendingUp,
  FolderTree,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';
import { SafeUser, Complaint, RW, RT } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';

interface SuperAdminDashboardProps {
  currentUser?: SafeUser | null;
  complaints: Complaint[];
  rws: RW[];
  rts: RT[];
  totalWarga: number;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  complaints,
  rws,
  rts,
  totalWarga,
}) => {
  const urgentCount = complaints.filter(
    (c) => c.priority === 'URGENT' && c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  ).length;

  const inProgressCount = complaints.filter(
    (c) =>
      c.status === 'ACCEPTED' ||
      c.status === 'ASSIGNED' ||
      c.status === 'IN_PROGRESS' ||
      c.status === 'FORWARDED'
  ).length;

  return (
    <div className="space-y-8">
      {/* Super Admin Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 text-xs font-mono font-bold border border-rose-500/30">
                SUPER ADMINISTRATOR
              </span>
              <span className="text-xs text-slate-400">Pusat Kendali Seluruh Wilayah</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Manajemen Sistem SIWARGA
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Pengawasan menyeluruh lintas RW & RT, audit log keamanan, manajemen pengguna, konfigurasi master data kategori, dan SLA layanan publik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-800" />
              <span>Kelola Pengguna & Role</span>
            </Link>
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-slate-700 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Audit Log Keamanan</span>
            </Link>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Laporan</span>
              <Inbox className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {complaints.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Dari seluruh RW & RT</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">Aktif Diproses</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-2">
              {inProgressCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Dalam tahap penanganan</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Selesai Ditangani</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-2">
              {resolvedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Terselesaikan tuntas</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-bold uppercase tracking-wider">Cakupan Wilayah</span>
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-200 mt-2">
              {rws.length} RW / {rts.length} RT
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{totalWarga} warga terdaftar</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Complaints Table / List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Pengaduan Masuk Seluruh Wilayah ({complaints.length})
              </h3>
              <Link
                href="/complaints"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {complaints.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/complaints/${c.id}`}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-xs transition-colors block"
                >
                  <div className="truncate">
                    <span className="font-mono text-slate-400 text-[11px] mr-2">
                      #{c.ticket_number}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono mr-2">
                      RW {c.rw_number} / RT {c.rt_number}
                    </span>
                    <span className="font-medium text-slate-900">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} size="sm" />
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Master Data Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Master Data & Konfigurasi</h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/admin/regions"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-between font-medium text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Kelola RW & RT</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/categories"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-between font-medium text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-emerald-600" />
                  <span>Kategori Pengaduan & SLA</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/users"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-between font-medium text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Data Warga & Administrator</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/settings"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-between font-medium text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>Konfigurasi Sistem & Privasi</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
