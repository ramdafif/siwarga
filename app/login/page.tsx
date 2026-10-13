'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DEMO_PRESETS = [
    {
      role: 'Super Admin',
      name: 'Dr. Hendra Gunawan',
      email: 'superadmin@siwarga.id',
      badge: 'Super Admin',
      bgClass: 'hover:border-purple-300 hover:bg-purple-50/40',
    },
    {
      role: 'Admin RW 01',
      name: 'H. Sudirman, S.E.',
      email: 'rw01@siwarga.id',
      badge: 'Ketua RW',
      bgClass: 'hover:border-blue-300 hover:bg-blue-50/40',
    },
    {
      role: 'Admin RT 01',
      name: 'Ahmad Fauzi',
      email: 'rt01.rw01@siwarga.id',
      badge: 'Ketua RT',
      bgClass: 'hover:border-amber-300 hover:bg-amber-50/40',
    },
    {
      role: 'Karang Taruna',
      name: 'Rizky Pratama',
      email: 'karangtaruna.rw01@siwarga.id',
      badge: 'Karang Taruna',
      bgClass: 'hover:border-emerald-300 hover:bg-emerald-50/40',
    },
    {
      role: 'Warga',
      name: 'Budi Santoso',
      email: 'budi.santoso@warga.id',
      badge: 'Warga RT 01',
      bgClass: 'hover:border-teal-300 hover:bg-teal-50/40',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login gagal.');
        setLoading(false);
        return;
      }

      window.location.assign('/dashboard');
    } catch {
      setError('Terjadi kendala jaringan saat menghubungi server.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: presetEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal masuk akun demo.');
        setLoading(false);
        return;
      }

      window.location.assign('/dashboard');
    } catch {
      setError('Terjadi kendala jaringan.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            SW
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            SIWARGA
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Masuk ke Portal Wilayah
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Silakan masukkan kredensial akun atau pilih simulasi peran demo di bawah
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-200 rounded-3xl">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Default: admin123 / warga123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Memproses...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Simulasi Instan 5 Peran (1-Click)</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                Evaluator Ready
              </span>
            </div>

            <div className="space-y-1.5">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.email}
                  type="button"
                  onClick={() => handleQuickLogin(preset.email)}
                  disabled={loading}
                  className={`w-full p-2.5 rounded-xl border border-slate-200 text-left transition-all flex items-center justify-between group ${preset.bgClass}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-800">
                        {preset.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded">
                        {preset.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block truncate">
                      {preset.email}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun warga?{' '}
            <Link href="/register" className="text-emerald-700 hover:underline font-semibold">
              Daftar Mandiri
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
