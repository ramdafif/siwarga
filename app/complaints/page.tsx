'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { Complaint, ComplaintCategory, ComplaintStatus, ComplaintPriority, SafeUser } from '@/lib/types';
import {
  Search,
  Filter,
  PlusCircle,
  Inbox,
  X,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

function ComplaintsContent() {
  const searchParams = useSearchParams();
  const initialMy = searchParams.get('my') === 'true';
  const initialPriority = searchParams.get('priority') || '';

  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>(initialPriority);
  const [onlyMy, setOnlyMy] = useState(initialMy);

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.user))
      .catch(() => {});

    // Fetch categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (search) params.append('keyword', search);
      if (onlyMy) params.append('my', 'true');

      const res = await fetch(`/api/complaints?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedStatus, selectedCategory, selectedPriority, onlyMy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleClearFilter = () => {
    setSearch('');
    setSelectedStatus('');
    setSelectedCategory('');
    setSelectedPriority('');
    setOnlyMy(false);
  };

  const hasActiveFilters = Boolean(
    search || selectedStatus || selectedCategory || selectedPriority || onlyMy
  );

  return (
    <AppShell currentUser={currentUser}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Daftar Pengaduan Warga
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transparansi pelaporan, verifikasi RT/RW, dan rekam jejak penyelesaian masalah
          </p>
        </div>

        <Link
          href="/complaints/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Pengaduan Baru</span>
        </Link>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 mb-6">
        {currentUser && (
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setOnlyMy(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !onlyMy
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua Pengaduan Wilayah
            </button>
            <button
              onClick={() => setOnlyMy(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                onlyMy
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pengaduan Saya
            </button>
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor tiket, judul, alamat kejadian..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Cari
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="">Semua Status</option>
            <option value="SUBMITTED">Terkirim</option>
            <option value="VERIFICATION">Verifikasi RT</option>
            <option value="ACCEPTED">Diterima</option>
            <option value="ASSIGNED">Ditugaskan</option>
            <option value="IN_PROGRESS">Sedang Diproses</option>
            <option value="RESOLVED">Selesai</option>
            <option value="REJECTED">Ditolak</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="">Semua Prioritas</option>
            <option value="LOW">Rendah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HIGH">Tinggi</option>
            <option value="URGENT">Mendesak (Urgent)</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilter}
              className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Complaints List Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Memuat pengaduan warga...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">
              Tidak ada pengaduan ditemukan
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Tidak ada laporan yang sesuai dengan kriteria filter pencarian Anda.'
                : 'Belum ada pengaduan warga yang terdaftar saat ini.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilter}
                className="mt-3 text-xs text-emerald-700 hover:underline font-semibold"
              >
                Hapus Semua Filter
              </button>
            )}
          </div>
        ) : (
          complaints.map((c) => <ComplaintCard key={c.id} complaint={c} />)
        )}
      </div>
    </AppShell>
  );
}

export default function ComplaintsListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-xs text-slate-400">
          Memuat halaman pengaduan warga...
        </div>
      }
    >
      <ComplaintsContent />
    </Suspense>
  );
}
