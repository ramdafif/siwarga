'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, User, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { RW, RT } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    rw_id: '',
    rt_id: '',
  });

  const [rws, setRws] = useState<RW[]>([]);
  const [rts, setRts] = useState<RT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/regions')
      .then((res) => res.json())
      .then((data) => {
        setRws(data.rws || []);
        setRts(data.rts || []);
        if (data.rws && data.rws.length > 0) {
          setFormData((prev) => ({
            ...prev,
            rw_id: data.rws[0].id,
            rt_id: data.rts && data.rts[0] ? data.rts[0].id : '',
          }));
        }
      })
      .catch(() => {});
  }, []);

  const filteredRts = rts.filter((rt) => rt.rw_id === formData.rw_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
      setError('NIK wajib berupa 16 digit angka.');
      setLoading(false);
      return;
    }

    if (formData.phone.length < 10) {
      setError('Nomor HP/WhatsApp minimal 10 digit.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Pendaftaran gagal.');
        setLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('Terjadi kendala jaringan.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            SW
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            SIWARGA
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Pendaftaran Warga Baru
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Daftarkan identitas Anda untuk menyampaikan pengaduan & mengakses layanan wilayah
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-200 rounded-3xl">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap (Sesuai KTP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                placeholder="317406..."
                required
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Privasi terjaga: NIK Anda akan disamarkan secara otomatis di sistem.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08123456789"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wilayah RW <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.rw_id}
                  onChange={(e) => {
                    const rwId = e.target.value;
                    const defaultRt = rts.find((rt) => rt.rw_id === rwId)?.id || '';
                    setFormData({ ...formData, rw_id: rwId, rt_id: defaultRt });
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wilayah RT <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.rt_id}
                  onChange={(e) => setFormData({ ...formData, rt_id: e.target.value })}
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Rumah / Domisili Lengkap
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Melati No. 12, Blok B..."
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar Sebagai Warga'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-emerald-700 hover:underline font-semibold">
              Masuk di Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
