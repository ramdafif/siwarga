'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  HelpCircle,
  PhoneCall,
  ChevronRight,
  ShieldAlert,
  Megaphone,
  Calendar,
  MapPin,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { SafeUser, Complaint, Announcement, Event } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';

interface WargaDashboardProps {
  currentUser?: SafeUser | null;
  myComplaints: Complaint[];
  publicComplaints: Complaint[];
  announcements: Announcement[];
  events: Event[];
  rtName?: string;
  rwName?: string;
  rtLeaderName?: string;
  rtLeaderPhone?: string;
  rwLeaderName?: string;
  rwLeaderPhone?: string;
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({
  currentUser,
  myComplaints,
  publicComplaints,
  announcements,
  events,
  rtName,
  rwName,
  rtLeaderName,
  rtLeaderPhone,
  rwLeaderName,
  rwLeaderPhone,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');

  // Stats calculation for Warga
  const totalMyComplaints = myComplaints.length;
  const inProgressMyComplaints = myComplaints.filter(
    (c) =>
      c.status === 'SUBMITTED' ||
      c.status === 'VERIFICATION' ||
      c.status === 'ACCEPTED' ||
      c.status === 'ASSIGNED' ||
      c.status === 'IN_PROGRESS' ||
      c.status === 'FORWARDED'
  ).length;
  const resolvedMyComplaints = myComplaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  ).length;

  // Registered events state mockup
  const [eventFilter, setEventFilter] = useState<'all' | 'my'>('all');

  const displayName = currentUser?.name || 'Warga';

  return (
    <div className="space-y-8">
      {/* 1. WARGA HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 sm:p-8 text-white shadow-lg">
        {/* Decorative background blurs */}
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-teal-300/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-medium border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal Warga SIWARGA</span>
              <span className="text-white/60">·</span>
              <span>{rtName || 'RT 01'} / {rwName || 'RW 01'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Halo, {displayName}!
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Sampaikan aspirasi lingkungan, laporkan kendala fasilitas umum, dan pantau pengumuman resmi wilayah RT/RW Anda secara transparan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/complaints/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Buat Pengaduan Baru</span>
            </Link>
            <Link
              href="/complaints"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-sm border border-white/20 transition-all"
            >
              <FileText className="w-4.5 h-4.5" />
              <span>Riwayat Saya</span>
            </Link>
          </div>
        </div>

        {/* Quick status counters inside the hero */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-black/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-emerald-200 text-xs flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5" /> Total Pengaduan Saya
            </div>
            <div className="text-2xl font-bold text-white mt-1">{totalMyComplaints}</div>
          </div>
          <div className="bg-black/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-amber-200 text-xs flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5" /> Sedang Ditangani
            </div>
            <div className="text-2xl font-bold text-amber-200 mt-1">{inProgressMyComplaints}</div>
          </div>
          <div className="bg-black/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-emerald-200 text-xs flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai Teratasi
            </div>
            <div className="text-2xl font-bold text-emerald-100 mt-1">{resolvedMyComplaints}</div>
          </div>
          <div className="bg-black/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-blue-200 text-xs flex items-center gap-1.5 font-medium">
              <Megaphone className="w-3.5 h-3.5" /> Pengumuman Aktif
            </div>
            <div className="text-2xl font-bold text-white mt-1">{announcements.length}</div>
          </div>
        </div>
      </div>

      {/* 2. WARGA WORKFLOW TRACKER CARDS & QUICK ACCESS GUIDE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3">
            1
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Laporkan Masalah</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Foto kendala lingkungan (jalan berlubang, sampah, lampu mati) dan cantumkan lokasi jelas.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
            2
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Verifikasi RT & Tindak Lanjut</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ketua RT mengecek laporan, memberi konfirmasi, dan berkoordinasi dengan RW atau tim lapangan.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mb-3">
            3
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Penyelesaian Transparan</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Dapatkan notifikasi tahapan perbaikan beserta bukti foto dokumentasi setelah masalah selesai.
          </p>
        </div>
      </div>

      {/* 3. MAIN SECTION: COMPLAINTS & RIGHT SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Complaint Stream */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs: My Complaints vs Public Complaints */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('my')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'my'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Pengaduan Saya ({myComplaints.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('public')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'public'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Pengaduan Publik Sekitar ({publicComplaints.length})
                </button>
              </div>

              <Link
                href="/complaints"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Complaint List */}
            <div className="mt-4 space-y-3">
              {activeTab === 'my' ? (
                myComplaints.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-slate-800">Belum Ada Pengaduan</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Anda belum pernah membuat laporan pengaduan. Ada fasilitas rusak atau keluhan di lingkungan?
                    </p>
                    <Link
                      href="/complaints/create"
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Buat Pengaduan Pertama</span>
                    </Link>
                  </div>
                ) : (
                  myComplaints.slice(0, 5).map((c) => (
                    <Link
                      key={c.id}
                      href={`/complaints/${c.id}`}
                      className="group block p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-slate-500">#{c.ticket_number}</span>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={c.priority} />
                          <StatusBadge status={c.status} size="sm" />
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors mt-2">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {c.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-50">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{c.address_location}</span>
                        </span>
                        <span>
                          {new Date(c.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </Link>
                  ))
                )
              ) : (
                publicComplaints.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                    Belum ada pengaduan publik di wilayah Anda.
                  </div>
                ) : (
                  publicComplaints.slice(0, 5).map((c) => (
                    <Link
                      key={c.id}
                      href={`/complaints/${c.id}`}
                      className="group block p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-slate-500">#{c.ticket_number}</span>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={c.priority} />
                          <StatusBadge status={c.status} size="sm" />
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors mt-2">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {c.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-50">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>RT {c.rt_number || '01'} / RW {c.rw_number || '01'}</span>
                        </span>
                        <span>Pelapor: {c.reporter_name || 'Warga'}</span>
                      </div>
                    </Link>
                  ))
                )
              )}
            </div>
          </div>

          {/* Quick FAQ / Panduan Pengaduan */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Panduan Pelaporan Pengaduan</span>
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>Pastikan melampirkan foto jelas untuk mempercepat proses verifikasi oleh Ketua RT.</li>
              <li>Untuk hal darurat (bencana, kebakaran, kriminalitas), hubungi kontak darurat segera.</li>
              <li>Tandai opsi <span className="font-semibold text-slate-800">Publik</span> bila keluhan menyangkut kepentingan umum masyarakat banyak.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Emergency & Pengurus Contact, Announcements & Events */}
        <div className="space-y-6">
          {/* Emergency & Official Contacts Widget */}
          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Kontak Pengurus & Darurat</span>
            </h3>
            <div className="space-y-3">
              {/* Ketua RT Contact */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Ketua RT Anda
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {rtLeaderName || 'Ahmad Fauzi'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {rtLeaderPhone || '081234567890'}
                  </div>
                </div>
                {rtLeaderPhone && (
                  <a
                    href={`https://wa.me/62${rtLeaderPhone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                  >
                    Hubungi
                  </a>
                )}
              </div>

              {/* Ketua RW Contact */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
                    Ketua RW
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {rwLeaderName || 'H. Sudirman, S.E.'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {rwLeaderPhone || '081288991122'}
                  </div>
                </div>
                {rwLeaderPhone && (
                  <a
                    href={`https://wa.me/62${rwLeaderPhone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                  >
                    Hubungi
                  </a>
                )}
              </div>

              {/* Call Center Darurat */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Darurat Nasional (Polisi / Medis)</span>
                <span className="font-mono font-bold text-rose-600">112 / 110</span>
              </div>
            </div>
          </div>

          {/* Announcements Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                <span>Pengumuman Wilayah</span>
              </h3>
              <Link
                href="/announcements"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  Tidak ada pengumuman aktif.
                </div>
              ) : (
                announcements.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    href="/announcements"
                    className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors"
                  >
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-medium">
                      {a.target_audience === 'ALL' ? 'Semua Warga' : a.target_audience}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {a.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {a.content}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Kegiatan Mendatang</span>
              </h3>
              <Link
                href="/events"
                className="text-xs font-semibold text-purple-700 hover:text-purple-800"
              >
                Lihat Agenda
              </Link>
            </div>

            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  Tidak ada kegiatan mendatang.
                </div>
              ) : (
                events.slice(0, 3).map((evt) => (
                  <Link
                    key={evt.id}
                    href="/events"
                    className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{evt.event_date}</span>
                      <span>{evt.event_time}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {evt.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </p>
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Penyelenggara: {evt.organizer}</span>
                      <span className="text-emerald-700 font-medium">
                        {evt.registered_count || 0}/{evt.quota} Peserta
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
