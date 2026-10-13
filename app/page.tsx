import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { store } from '@/lib/db/store';
import { AppShell } from '@/components/layout/AppShell';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck,
  Building2,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import { RoleSwitcher } from '@/components/admin/RoleSwitcher';

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  const stats = store.getGlobalStats();
  const publicComplaints = store
    .getComplaints({ is_public: true })
    .slice(0, 4);
  const announcements = store.getAnnouncements().slice(0, 3);

  return (
    <AppShell currentUser={currentUser}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 mb-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Informasi & Pengaduan Warga Wilayah RT/RW</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Transparansi & Respon Cepat Pelayanan Lingkungan.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            SIWARGA menghubungkan masyarakat, Ketua RT, Pengurus RW, dan Karang Taruna
            dalam satu platform terpadu. Laporkan aspirasi, pantau proses tindak lanjut,
            dan ikuti perkembangan kegiatan lingkungan secara real-time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={currentUser ? '/complaints/create' : '/login'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all"
            >
              <span>Buat Pengaduan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/complaints"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-all"
            >
              Lihat Pengaduan Publik
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all"
            >
              Buka Dashboard
            </Link>
          </div>
        </div>

        {/* Quick metrics in hero */}
        <div className="mt-10 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
              {stats.totalComplaints}
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">Total Pengaduan</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-teal-400">
              {stats.resolvedComplaints}
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">Selesai Ditangani</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-blue-400">
              {stats.totalWarga}+
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">Warga Terdaftar</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
              {stats.totalRT} RT / {stats.totalRW} RW
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">Cakupan Wilayah</span>
          </div>
        </div>
      </section>

      {/* RBAC Simulation Callout */}
      <section className="mb-10 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Simulasi Multi-Role & Access Control (RBAC)
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Gunakan pemilih peran untuk menguji alur kerja Super Admin, Admin RW, Admin RT,
              Karang Taruna, dan Warga tanpa perlu log out manual.
            </p>
          </div>
          <div className="shrink-0">
            <RoleSwitcher currentUser={currentUser} />
          </div>
        </div>
      </section>

      {/* Workflow Explanation Section */}
      <section className="mb-10">
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Alur Penanganan Pengaduan Berjenjang
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dari laporan awal warga hingga verifikasi berjenjang RT/RW dan penyelesaian tuntas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3">
              1
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Laporan Diajukan</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Warga mengisi detail permasalahan, memilih lokasi kejadian, dan melampirkan foto/video bukti.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mb-3">
              2
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Verifikasi Ketua RT</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Pengurus RT memeriksa kebenaran data, memberikan tanggapan awal, atau meneruskan ke RW jika butuh penanganan wilayah luas.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mb-3">
              3
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Disposisi & Penanganan</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Tugas didisposisikan kepada Karang Taruna atau satgas lingkungan untuk eksekusi perbaikan di lapangan.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
              4
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Selesai & Transparan</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Foto bukti penyelesaian diunggah, status diubah menjadi Selesai, dan riwayat audit tersimpan permanen.
            </p>
          </div>
        </div>
      </section>

      {/* Public Complaints & Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Public Complaints (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pengaduan Terkini Masyarakat</h2>
              <p className="text-xs text-slate-500">Transparansi aspirasi warga di lingkungan RW 01</p>
            </div>
            <Link
              href="/complaints"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Semua Pengaduan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {publicComplaints.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                Belum ada pengaduan publik.
              </div>
            ) : (
              publicComplaints.map((c) => <ComplaintCard key={c.id} complaint={c} />)
            )}
          </div>
        </div>

        {/* Announcements Sidebar (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-emerald-600" />
              <span>Pengumuman Wilayah</span>
            </h2>
            <Link
              href="/announcements"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <Link
                key={ann.id}
                href={`/announcements`}
                className="block p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-100">
                  <span className="font-semibold text-emerald-700">
                    {ann.target_audience === 'ALL'
                      ? 'Seluruh Warga'
                      : `Untuk ${ann.target_audience}`}
                  </span>
                  <span>{new Date(ann.publish_date).toLocaleDateString('id-ID')}</span>
                </div>
                <h3 className="mt-2 text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                  {ann.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
                <span className="mt-2 text-[10px] text-slate-400 block font-mono">
                  Oleh: {ann.author_name} ({ann.author_role})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
