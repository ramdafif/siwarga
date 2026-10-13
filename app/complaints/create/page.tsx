'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { LocationPicker } from '@/components/complaints/LocationPicker';
import { FileUploader, UploadedFileItem } from '@/components/complaints/FileUploader';
import { ComplaintCategory, ComplaintPriority, RW, RT, SafeUser } from '@/lib/types';
import {
  MessageSquarePlus,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  Tag,
} from 'lucide-react';

export default function CreateComplaintPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [rws, setRws] = useState<RW[]>([]);
  const [rts, setRts] = useState<RT[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');
  const [rwId, setRwId] = useState('');
  const [rtId, setRtId] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isPublic, setIsPublic] = useState(true);
  const [files, setFiles] = useState<UploadedFileItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Current user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          if (data.user.rw_id) setRwId(data.user.rw_id);
          if (data.user.rt_id) setRtId(data.user.rt_id);
        }
      })
      .catch(() => {});

    // Categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const cats = data.categories || [];
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      })
      .catch(() => {});

    // Regions
    fetch('/api/regions')
      .then((res) => res.json())
      .then((data) => {
        setRws(data.rws || []);
        setRts(data.rts || []);
        if (data.rws && data.rws.length > 0 && !rwId) {
          setRwId(data.rws[0].id);
        }
        if (data.rts && data.rts.length > 0 && !rtId) {
          setRtId(data.rts[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const filteredRts = rts.filter((rt) => rt.rw_id === rwId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Harap masuk (login) terlebih dahulu untuk membuat pengaduan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category_id: categoryId,
          priority,
          rw_id: rwId,
          rt_id: rtId,
          address_location: address,
          latitude,
          longitude,
          is_public: isPublic,
          attachments: files,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal membuat pengaduan.');
        setLoading(false);
        return;
      }

      router.push(`/complaints/${data.complaint.id}`);
    } catch {
      setError('Terjadi kendala jaringan saat mengirimkan pengaduan.');
      setLoading(false);
    }
  };

  const priorityOptions: Array<{ id: ComplaintPriority; label: string; desc: string; color: string }> = [
    { id: 'LOW', label: 'Rendah', desc: 'Saran & aspirasi umum', color: 'border-slate-200 text-slate-700' },
    { id: 'MEDIUM', label: 'Sedang', desc: 'Permasalahan berkala harian', color: 'border-amber-300 text-amber-900 bg-amber-50/50' },
    { id: 'HIGH', label: 'Tinggi', desc: 'Mengganggu kenyamanan bersama', color: 'border-orange-300 text-orange-950 bg-orange-50/50' },
    { id: 'URGENT', label: 'Mendesak (Urgent)', desc: 'Bahaya keselamatan / banjir / pohon tumbang', color: 'border-rose-400 text-rose-950 bg-rose-50/80 font-bold' },
  ];

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
              FORMULIR ASPIRASI
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Buat Pengaduan Masyarakat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sampaikan laporan permasalahan lingkungan dengan rincian yang jelas untuk penanganan berjenjang RT dan RW.
          </p>
        </div>

        {/* Not Logged In Warning */}
        {!currentUser && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <p className="text-xs text-amber-900">
                Anda belum masuk. Silakan masuk terlebih dahulu dengan akun demo atau akun warga.
              </p>
            </div>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0"
            >
              Masuk Sekarang
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Kategori Permasalahan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-900">{cat.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Tingkat Urgensi / Prioritas <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriority(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${opt.color} ${
                      isSelected ? 'ring-2 ring-slate-900' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className="text-xs block">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Judul Pengaduan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Lampu Penerangan Jalan Depan Pos Ronda Rusak"
              required
              minLength={5}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Deskripsi Masalah Lengkap <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara detail masalah yang terjadi, waktu kejadian, dampak yang dirasakan, dan harapan tindak lanjut..."
              required
              minLength={15}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Wilayah Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Wilayah RW <span className="text-rose-500">*</span>
              </label>
              <select
                value={rwId}
                onChange={(e) => {
                  const selectedRw = e.target.value;
                  setRwId(selectedRw);
                  const firstRt = rts.find((r) => r.rw_id === selectedRw)?.id || '';
                  setRtId(firstRt);
                }}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              >
                {rws.map((rw) => (
                  <option key={rw.id} value={rw.id}>
                    RW {rw.number} ({rw.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Wilayah RT <span className="text-rose-500">*</span>
              </label>
              <select
                value={rtId}
                onChange={(e) => setRtId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              >
                {filteredRts.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    RT {rt.number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Picker */}
          <LocationPicker
            address={address}
            onChangeAddress={setAddress}
            latitude={latitude}
            longitude={longitude}
            onChangeCoordinates={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />

          {/* Evidence File Uploader */}
          <FileUploader files={files} onChangeFiles={setFiles} />

          {/* Visibility / Privacy Option */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Eye className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-slate-200 text-slate-700">
                  <EyeOff className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {isPublic ? 'Pengaduan Terbuka (Publik)' : 'Pengaduan Privat'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isPublic
                    ? 'Dapat dilihat oleh warga lain di portal (nama pelapor tetap terlindungi)'
                    : 'Hanya dapat dilihat oleh Anda dan Pengurus RT/RW'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                isPublic
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {isPublic ? 'Publik' : 'Privat'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !currentUser}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Mengirimkan Pengaduan...' : 'Kirim Pengaduan Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
