'use client';

import React from 'react';
import Link from 'next/link';
import {
  Inbox,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  Megaphone,
  MapPin,
  ChevronRight,
  PlusCircle,
  Camera,
} from 'lucide-react';
import { SafeUser, Complaint, Event, Announcement } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';

interface KarangTarunaDashboardProps {
  currentUser?: SafeUser | null;
  assignedComplaints: Complaint[];
  events: Event[];
  announcements: Announcement[];
}

export const KarangTarunaDashboard: React.FC<KarangTarunaDashboardProps> = ({
  currentUser,
  assignedComplaints,
  events,
  announcements,
}) => {
  const displayName = currentUser?.name || 'Karang Taruna';

  return (
    <div className="space-y-8">
      {/* 1. KT HEADER BANNER */}
      <div className="bg-linear-to-br from-purple-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-purple-200 text-xs font-medium border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal Kepemudaan & Karang Taruna</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Halo, {displayName}!
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Pusat aksi pemuda wilayah RW. Tangani tugas aksi lingkungan dari pengurus RW, kelola pendaftaran kegiatan, dan publikasikan program kerja pemuda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-purple-900 font-bold text-sm shadow-md hover:bg-purple-50 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-5 h-5 text-purple-600" />
              <span>Kelola Kegiatan Pemuda</span>
            </Link>
          </div>
        </div>

        {/* METRICS */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-black/15 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-purple-200 text-xs flex items-center gap-1.5 font-medium">
              <Inbox className="w-3.5 h-3.5" /> Tugas Disposisi RW
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {assignedComplaints.length}
            </div>
          </div>
          <div className="bg-black/15 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-purple-200 text-xs flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" /> Program Kerja Aktif
            </div>
            <div className="text-2xl font-bold text-white mt-1">{events.length}</div>
          </div>
          <div className="bg-black/15 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-purple-200 text-xs flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5" /> Total Partisipan
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {events.reduce((acc, curr) => acc + (curr.registered_count || 0), 0)}
            </div>
          </div>
          <div className="bg-black/15 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-purple-200 text-xs flex items-center gap-1.5 font-medium">
              <Megaphone className="w-3.5 h-3.5" /> Pengumuman Pemuda
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {announcements.length}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Assigned Tasks & Field Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-purple-600" />
                  <span>Pengaduan Ditugaskan ke Karang Taruna ({assignedComplaints.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Laporan masyarakat yang dipercayakan Ketua RW untuk aksi pemuda
                </p>
              </div>
              <Link
                href="/complaints"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {assignedComplaints.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  Belum ada pengaduan yang ditugaskan ke Karang Taruna saat ini.
                </div>
              ) : (
                assignedComplaints.map((c) => (
                  <Link
                    key={c.id}
                    href={`/complaints/${c.id}`}
                    className="group block p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-slate-500">#{c.ticket_number}</span>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={c.priority} />
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition-colors mt-2">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {c.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-50">
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{c.address_location}</span>
                      </span>
                      <span className="text-purple-600 font-semibold flex items-center gap-1">
                        Aksi Lapangan & Dokumentasi <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Agenda Kegiatan Pemuda */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Program Kerja & Kegiatan ({events.length})</span>
              </h3>
              <Link
                href="/events"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                Kelola Semua
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {events.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{evt.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {evt.event_date} · {evt.location}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                      {evt.registered_count || 0}/{evt.quota} Peserta
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col */}
        <div className="space-y-6">
          <div className="bg-purple-50/50 rounded-2xl border border-purple-100 p-5">
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider mb-2">
              Peran Karang Taruna
            </h4>
            <p className="text-xs text-purple-900 leading-relaxed">
              Sebagai motor penggerak lingkungan, Karang Taruna membantu penanganan kendala kebersihan, pengorganisasian kerja bakti warga, dan pendokumentasian bukti perbaikan ke sistem.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span>Pengumuman</span>
              </h3>
              <Link
                href="/announcements"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                Lihat
              </Link>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 3).map((a) => (
                <Link
                  key={a.id}
                  href="/announcements"
                  className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors"
                >
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{a.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{a.content}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
