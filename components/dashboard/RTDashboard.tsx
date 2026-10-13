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
  MapPin,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Check,
  X,
  Send,
  Megaphone,
  UserCheck,
  PlusCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { SafeUser, Complaint, Announcement, User as UserModel } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';

interface RTDashboardProps {
  currentUser?: SafeUser | null;
  complaints: Complaint[];
  wargaList: UserModel[];
  announcements: Announcement[];
  rtName?: string;
  rwName?: string;
  rtNumber?: string;
  rwNumber?: string;
}

export const RTDashboard: React.FC<RTDashboardProps> = ({
  currentUser,
  complaints,
  wargaList,
  announcements,
  rtName,
  rwName,
  rtNumber,
  rwNumber,
}) => {
  const router = useRouter();

  // Filter queues
  const needVerification = complaints.filter(
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
  const urgentCount = complaints.filter(
    (c) => c.priority === 'URGENT' && c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  ).length;

  // Quick Action Modal states for fast inline triage
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [modalType, setModalType] = useState<'verify' | 'forward' | 'resolve' | null>(null);
  const [notes, setNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !modalType) return;
    setLoadingAction(true);
    setActionError(null);

    let nextStatus: string = 'ACCEPTED';
    if (modalType === 'verify') nextStatus = 'ACCEPTED';
    if (modalType === 'forward') nextStatus = 'FORWARDED';
    if (modalType === 'resolve') nextStatus = 'RESOLVED';

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          notes: notes.trim() || `Tindakan cepat RT: ${nextStatus}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Gagal memproses tindakan.');
        setLoadingAction(false);
        return;
      }

      setModalType(null);
      setSelectedComplaint(null);
      setNotes('');
      router.refresh();
    } catch {
      setActionError('Terjadi kendala jaringan.');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. RT HEADER BANNER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-mono font-semibold border border-blue-200">
                PENGURUS RT
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Wilayah {rtName || `RT ${rtNumber || '01'}`} / {rwName || `RW ${rwNumber || '01'}`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Operasional RT {rtNumber || '01'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Pusat kendali pelayanan lingkungan tingkat rukun tetangga. Verifikasi laporan warga dengan cepat, lakukan pendataan warga, atau teruskan permasalahan berskala besar ke RW.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/complaints"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Inbox className="w-4 h-4" />
              <span>Kelola Pengaduan RT ({complaints.length})</span>
            </Link>
            <Link
              href="/announcements"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Megaphone className="w-4 h-4 text-amber-600" />
              <span>Buat Pengumuman RT</span>
            </Link>
          </div>
        </div>

        {/* RT KEY METRICS ROW */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-xs font-bold uppercase tracking-wider">Perlu Verifikasi</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-2">
              {needVerification.length}
            </div>
            <div className="text-[11px] text-amber-800 mt-0.5">Menunggu respon Ketua RT</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-xs font-bold uppercase tracking-wider">Sedang Ditangani</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-950 mt-2">
              {inProgress.length}
            </div>
            <div className="text-[11px] text-blue-800 mt-0.5">Proses perbaikan / koordinasi</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-bold uppercase tracking-wider">Tuntas / Selesai</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-2">
              {resolved.length}
            </div>
            <div className="text-[11px] text-emerald-800 mt-0.5">Kendala warga teratasi</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider">Warga Terdata RT</span>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {wargaList.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Warga aktif di RT {rtNumber || '01'}</div>
          </div>
        </div>
      </div>

      {/* 2. URGENT ALERT (IF ANY) */}
      {urgentCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-950">
                Peringatan: {urgentCount} Pengaduan Berkategori Urgent di Lingkungan Anda
              </h4>
              <p className="text-[11px] sm:text-xs text-rose-700">
                Laporan membutuhkan penanganan segera (bahaya fisik, korsleting, atau keamanan).
              </p>
            </div>
          </div>
          <Link
            href="/complaints?priority=URGENT"
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Tindak Lanjuti
          </Link>
        </div>
      )}

      {/* 3. MAIN WORKSPACE: VERIFICATION QUEUE & CITIZEN ROSTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Priority Verification & Complaint Inbox */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Needs RT Verification */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>Antrean Verifikasi RT ({needVerification.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Laporan baru masuk dari warga RT {rtNumber || '01'} yang perlu ditanggapi
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">Aksi Cepat 1-Klik</span>
            </div>

            <div className="mt-4 space-y-3">
              {needVerification.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  Semua pengaduan warga telah diverifikasi. Tidak ada antrean baru.
                </div>
              ) : (
                needVerification.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-50">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-slate-700">
                          #{comp.ticket_number}
                        </span>
                        <span>·</span>
                        <span className="text-slate-500">{comp.category_name}</span>
                        <span>·</span>
                        <span className="text-slate-500">
                          {new Date(comp.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={comp.priority} />
                        <StatusBadge status={comp.status} size="sm" />
                      </div>
                    </div>

                    <div className="py-2.5">
                      <Link
                        href={`/complaints/${comp.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {comp.title}
                      </Link>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {comp.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{comp.address_location}</span>
                        </span>
                        <span>·</span>
                        <span>Pelapor: <strong className="text-slate-700">{comp.reporter_name}</strong></span>
                      </div>
                    </div>

                    {/* RT Action Bar */}
                    <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/complaints/${comp.id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <span>Lihat Detail Laporan</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedComplaint(comp);
                            setModalType('verify');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Terima / Verifikasi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedComplaint(comp);
                            setModalType('forward');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Teruskan ke RW</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: All Active Complaints in RT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Pengaduan Aktif Sedang Diproses ({inProgress.length})
              </h3>
              <Link
                href="/complaints"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {inProgress.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Tidak ada pengaduan aktif yang sedang diproses.
                </div>
              ) : (
                inProgress.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    href={`/complaints/${c.id}`}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-xs transition-colors block"
                  >
                    <div className="truncate">
                      <span className="font-mono text-slate-400 text-[11px] mr-2">
                        #{c.ticket_number}
                      </span>
                      <span className="font-medium text-slate-800">{c.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={c.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Citizen Roster & Announcements */}
        <div className="space-y-6">
          {/* Daftar Warga RT Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Daftar Warga RT {rtNumber || '01'}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {wargaList.length} warga terdaftar di sistem
                </p>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Kelola
              </Link>
            </div>

            <div className="space-y-2.5">
              {wargaList.slice(0, 5).map((w) => (
                <div
                  key={w.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="truncate">
                    <div className="font-semibold text-slate-900 truncate">{w.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{w.address}</div>
                  </div>
                  <a
                    href={`https://wa.me/62${w.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded bg-white text-emerald-700 border border-emerald-200 text-[10px] font-mono hover:bg-emerald-50 shrink-0"
                  >
                    WA
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* RT Announcements */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span>Pengumuman Wilayah</span>
              </h3>
              <Link
                href="/announcements"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Kelola
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <Link
                  key={a.id}
                  href="/announcements"
                  className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors"
                >
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded font-medium">
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

          {/* Hubungi Pengurus RW */}
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
              Koordinasi dengan Pengurus RW
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed mb-3">
              Bila membutuhkan sarana berat, perbaikan jalan skala besar, atau izin terpusat, teruskan laporan pengaduan ke pihak RW.
            </p>
            <Link
              href="/complaints?status=FORWARDED"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
            >
              Cek Laporan yang Diteruskan ke RW →
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK ACTION MODAL FOR RT */}
      {selectedComplaint && modalType && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedComplaint(null);
            setModalType(null);
          }}
          title={
            modalType === 'verify'
              ? 'Verifikasi & Terima Pengaduan'
              : modalType === 'forward'
              ? 'Teruskan Pengaduan ke Pengurus RW'
              : 'Selesaikan Pengaduan'
          }
          description={`Tiket #${selectedComplaint.ticket_number}: ${selectedComplaint.title}`}
        >
          <form onSubmit={handleActionSubmit} className="space-y-4">
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan / Keterangan RT untuk Warga
              </label>
              <textarea
                rows={3}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  modalType === 'verify'
                    ? 'Contoh: Laporan diverifikasi. Petugas RT sudah mengecek lokasi dan siap menangani.'
                    : modalType === 'forward'
                    ? 'Contoh: Kerusakan memerlukan material skala RW. Diteruskan ke pengurus RW.'
                    : 'Contoh: Masalah telah terselesaikan tuntas di lapangan.'
                }
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedComplaint(null);
                  setModalType(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loadingAction}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingAction ? 'Menyimpan...' : 'Konfirmasi Tindakan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
