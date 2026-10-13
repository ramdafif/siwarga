'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building2,
  TrendingUp,
  Share2,
  Send,
  Sparkles,
  Megaphone,
  Check,
  ChevronRight,
  BarChart3,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { SafeUser, Complaint, RT, Announcement, ComplaintStatus, UserRole } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';

interface RWDashboardProps {
  currentUser?: SafeUser | null;
  complaints: Complaint[];
  rts: RT[];
  announcements: Announcement[];
  rwName?: string;
  rwNumber?: string;
}

export const RWDashboard: React.FC<RWDashboardProps> = ({
  currentUser,
  complaints,
  rts,
  announcements,
  rwName,
  rwNumber,
}) => {
  const router = useRouter();

  // Metrics
  const escalatedFromRT = complaints.filter(
    (c) => c.status === 'FORWARDED'
  );
  const needVerificationRW = complaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'VERIFICATION'
  );
  const inProgress = complaints.filter(
    (c) =>
      c.status === 'ACCEPTED' ||
      c.status === 'ASSIGNED' ||
      c.status === 'IN_PROGRESS' ||
      c.status === 'FORWARDED'
  );
  const resolved = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  );
  const urgentComplaints = complaints.filter(
    (c) => c.priority === 'URGENT' && c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  );

  // Distribution by RT
  const complaintsByRT: { rt: RT; total: number; pending: number; resolved: number }[] = rts.map(
    (rt) => {
      const rtComps = complaints.filter((c) => c.rt_id === rt.id);
      return {
        rt,
        total: rtComps.length,
        pending: rtComps.filter(
          (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED' && c.status !== 'REJECTED'
        ).length,
        resolved: rtComps.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
      };
    }
  );

  // Quick Disposisi/Assignment Modal for RW
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assignRole, setAssignRole] = useState<UserRole>('KARANG_TARUNA');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const handleDisposisiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setLoadingAssign(true);
    setAssignError(null);

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_role: assignRole,
          instructions: assignInstructions.trim() || 'Mohon segera ditindaklanjuti dan dikoordinasikan.',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAssignError(data.error || 'Gagal mendisposisikan tugas.');
        setLoadingAssign(false);
        return;
      }

      setSelectedComplaint(null);
      setAssignInstructions('');
      router.refresh();
    } catch {
      setAssignError('Terjadi kendala jaringan.');
    } finally {
      setLoadingAssign(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. RW HEADER BANNER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-semibold border border-indigo-200">
                PENGURUS RW
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Wilayah {rwName || `RW ${rwNumber || '01'}`} ({rts.length} Rukun Tetangga)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Eksekutif RW {rwNumber || '01'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Pusat pengawasan lintas RT, eskalasi penanganan sarana lingkungan, disposisi tugas Karang Taruna, dan evaluasi penyelesaian aspirasi warga.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Rekapitulasi & Ekspor Laporan</span>
            </Link>
            <Link
              href="/announcements"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold border border-indigo-200 transition-colors"
            >
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <span>Pengumuman Wilayah RW</span>
            </Link>
          </div>
        </div>

        {/* RW METRICS ROW */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/60">
            <div className="flex items-center justify-between text-indigo-700">
              <span className="text-xs font-bold uppercase tracking-wider">Eskalasi dari RT</span>
              <Share2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950 mt-2">
              {escalatedFromRT.length}
            </div>
            <div className="text-[11px] text-indigo-800 mt-0.5">Diteruskan untuk penanganan RW</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-xs font-bold uppercase tracking-wider">Perlu Tindak Lanjut</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-2">
              {needVerificationRW.length}
            </div>
            <div className="text-[11px] text-amber-800 mt-0.5">Laporan menunggu proses</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-xs font-bold uppercase tracking-wider">Sedang Dikerjakan</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-950 mt-2">
              {inProgress.length}
            </div>
            <div className="text-[11px] text-blue-800 mt-0.5">Dalam pengerjaan / disposisi</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-bold uppercase tracking-wider">Tingkat Tuntas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-2">
              {complaints.length > 0
                ? `${Math.round((resolved.length / complaints.length) * 100)}%`
                : '100%'}
            </div>
            <div className="text-[11px] text-emerald-800 mt-0.5">{resolved.length} dari {complaints.length} laporan tuntas</div>
          </div>
        </div>
      </div>

      {/* 2. URGENT ALERT (IF ANY) */}
      {urgentComplaints.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-950">
                Peringatan: {urgentComplaints.length} Pengaduan Berkategori URGENT di RW {rwNumber || '01'}
              </h4>
              <p className="text-[11px] sm:text-xs text-rose-700">
                Membutuhkan tindakan koordinasi cepat antar-RT atau pihak kelurahan.
              </p>
            </div>
          </div>
          <Link
            href="/complaints?priority=URGENT"
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Lihat Laporan Urgent
          </Link>
        </div>
      )}

      {/* 3. MAIN WORKSPACE: ESCALATED COMPLAINTS & CROSS-RT COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Escalated Complaints from RT + Disposisi Bar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Escalated from RT (Forwarded to RW) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                  <span>Antrean Eskalasi dari RT ({escalatedFromRT.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Laporan warga yang diteruskan oleh Ketua RT karena butuh sarana / wewenang RW
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-700">Perlu Disposisi RW</span>
            </div>

            <div className="mt-4 space-y-3">
              {escalatedFromRT.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  Tidak ada eskalasi pending dari RT. Koordinasi wilayah berjalan lancar.
                </div>
              ) : (
                escalatedFromRT.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-100/50">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-slate-800">
                          #{comp.ticket_number}
                        </span>
                        <span>·</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold text-[10px]">
                          Diteruskan RT {comp.rt_number}
                        </span>
                        <span>·</span>
                        <span className="text-slate-500">{comp.category_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={comp.priority} />
                        <StatusBadge status={comp.status} size="sm" />
                      </div>
                    </div>

                    <div className="py-2.5">
                      <Link
                        href={`/complaints/${comp.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {comp.title}
                      </Link>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {comp.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                        <span>Lokasi: <strong>{comp.address_location}</strong></span>
                        <span>·</span>
                        <span>Pelapor: {comp.reporter_name}</span>
                      </div>
                    </div>

                    {/* RW Actions */}
                    <div className="mt-2 pt-3 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/complaints/${comp.id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <span>Lihat Detail & Riwayat RT</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(comp)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Disposisi ke Tim / Karang Taruna</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: All RW Complaints Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Pengaduan Terbaru di RW {rwNumber || '01'} ({complaints.length})
              </h3>
              <Link
                href="/complaints"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Buka Filter Lengkap
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {complaints.slice(0, 5).map((c) => (
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
                      RT {c.rt_number || '01'}
                    </span>
                    <span className="font-medium text-slate-800">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={c.status} size="sm" />
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cross-RT Comparison & Overview */}
        <div className="space-y-6">
          {/* RT Comparison Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Perbandingan Wilayah per RT</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Aktivitas pengaduan warga di bawah naungan RW {rwNumber || '01'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {complaintsByRT.map((item) => {
                const completionPct = item.total > 0
                  ? Math.round((item.resolved / item.total) * 100)
                  : 100;
                return (
                  <div
                    key={item.rt.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        {item.rt.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Ketua: {item.rt.leader_name}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1 border-t border-slate-200/60">
                      <div>
                        <div className="text-slate-400">Total</div>
                        <div className="font-bold text-slate-800 mt-0.5">{item.total}</div>
                      </div>
                      <div>
                        <div className="text-amber-600 font-medium">Pending</div>
                        <div className="font-bold text-amber-700 mt-0.5">{item.pending}</div>
                      </div>
                      <div>
                        <div className="text-emerald-600 font-medium">Selesai</div>
                        <div className="font-bold text-emerald-700 mt-0.5">{item.resolved}</div>
                      </div>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Disposisi Karang Taruna */}
          <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-5">
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pemberdayaan Karang Taruna</span>
            </h4>
            <p className="text-xs text-indigo-800 leading-relaxed mb-3">
              Kaitkan kegiatan kepemudaan dengan penanganan masalah lingkungan, seperti kerja bakti gotong royong pembersihan sampah atau posko pengamanan.
            </p>
            <Link
              href="/events"
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline block"
            >
              Kelola Kegiatan & Agenda Bersama Karang Taruna →
            </Link>
          </div>

          {/* Announcements Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                <span>Pengumuman RW</span>
              </h3>
              <Link
                href="/announcements"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Buat Baru
              </Link>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 3).map((a) => (
                <Link
                  key={a.id}
                  href="/announcements"
                  className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors"
                >
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/60 px-1.5 py-0.5 rounded font-medium">
                    {a.target_audience === 'ALL' ? 'Semua Warga' : a.target_audience}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                    {a.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {a.content}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DISPOSISI MODAL FOR RW */}
      {selectedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedComplaint(null);
          }}
          title="Disposisi Pengaduan ke Pihak Pelaksana"
          description={`Tiket #${selectedComplaint.ticket_number}: ${selectedComplaint.title}`}
        >
          <form onSubmit={handleDisposisiSubmit} className="space-y-4">
            {assignError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {assignError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Pilih Pihak Pelaksana Tugas
              </label>
              <select
                value={assignRole}
                onChange={(e) => setAssignRole(e.target.value as UserRole)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="KARANG_TARUNA">Karang Taruna (Kegiatan Pemuda / Aksi Sosial)</option>
                <option value="ADMIN_RT">Ketua RT Asal (Pengawasan Lapangan)</option>
                <option value="ADMIN_RW">Tim Kerja Sarana & Prasarana RW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Instruksi & Arahan Khusus dari Ketua RW
              </label>
              <textarea
                rows={3}
                required
                value={assignInstructions}
                onChange={(e) => setAssignInstructions(e.target.value)}
                placeholder="Contoh: Mohon koordinasikan pemuda untuk kerja bakti akhir pekan ini dan laporkan bukti foto."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loadingAssign}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loadingAssign ? 'Menugaskan...' : 'Kirim Disposisi Tugas'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
