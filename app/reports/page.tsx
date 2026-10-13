'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { SafeUser } from '@/lib/types';
import {
  BarChart3,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Inbox,
  Filter,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function ReportsPage() {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.user))
      .catch(() => {});

    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadCsv = () => {
    window.location.href = '/api/reports?format=csv';
  };

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Statistik & Laporan Pelayanan Wilayah</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Rekapitulasi berkala pengaduan, kecepatan resolusi masalah, dan persebaran RT/RW
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Laporan (CSV)</span>
          </button>
        </div>

        {loading || !summary ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Menganalisis data pengaduan...
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Total Pengaduan Masuk"
                value={summary.total}
                subtitle="Data sesuai hak akses wilayah"
                icon={Inbox}
              />
              <StatCard
                title="Selesai Ditangani"
                value={summary.resolved}
                subtitle={`${Math.round((summary.resolved / (summary.total || 1)) * 100)}% tingkat tuntas`}
                icon={CheckCircle2}
                variant="success"
              />
              <StatCard
                title="Rata-rata Waktu Selesai"
                value={`${summary.avgResolutionHours} Jam`}
                subtitle="SLA standar respon < 48 Jam"
                icon={Clock}
                variant="info"
              />
              <StatCard
                title="Pengaduan Mendesak"
                value={summary.urgent}
                subtitle="Prioritas URGENT ditangani"
                icon={AlertTriangle}
                variant="urgent"
              />
            </div>

            {/* Distribution Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Sebaran Berdasarkan Kategori</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    {Object.keys(summary.byCategory).length} Kategori
                  </span>
                </h3>

                <div className="space-y-3">
                  {Object.entries(summary.byCategory).map(([cat, count]: [string, any]) => {
                    const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                          <span className="font-medium">{cat}</span>
                          <span className="font-mono text-slate-500">
                            {count} laporan ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Status Alur Kerja Pengaduan</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    Total {summary.total}
                  </span>
                </h3>

                <div className="space-y-3">
                  {Object.entries(summary.byStatus).map(([st, count]: [string, any]) => {
                    const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                    return (
                      <div key={st}>
                        <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                          <span className="font-semibold text-slate-800">{st}</span>
                          <span className="font-mono text-slate-500">
                            {count} laporan ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-900 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Regional Breakdown */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Frekuensi Pengaduan per Unit RT / RW</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {Object.entries(summary.byRT).map(([rtLabel, count]: [string, any]) => (
                  <div key={rtLabel} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-medium text-slate-600">{rtLabel}</span>
                    <span className="block text-xl font-bold font-mono text-slate-900 mt-1">
                      {count}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Laporan tercatat</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
