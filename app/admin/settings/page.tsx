'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SystemConfig, SafeUser } from '@/lib/types';
import { Settings, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [settings, setSettings] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.user))
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.config))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      alert('Gagal menyimpan pengaturan.');
    }
  };

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Konfigurasi & Pengaturan Sistem</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Parameter operasional global aplikasi SIWARGA (Super Admin)
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Konfigurasi sistem berhasil diperbarui.</span>
          </div>
        )}

        {loading || !settings ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Memuat konfigurasi...
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Aplikasi
              </label>
              <input
                type="text"
                value={settings.app_name}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelurahan / Desa
                </label>
                <input
                  type="text"
                  value={settings.subdistrict_name}
                  onChange={(e) => setSettings({ ...settings, subdistrict_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  value={settings.city_name}
                  onChange={(e) => setSettings({ ...settings, city_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Kontak Bantuan
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Telepon / Call Center
                </label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allow_citizen_registration}
                  onChange={(e) =>
                    setSettings({ ...settings, allow_citizen_registration: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Buka Pendaftaran Warga Mandiri
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Warga dapat mendaftar mandiri melalui halaman registrasi publik
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_auto_triage}
                  onChange={(e) =>
                    setSettings({ ...settings, enable_auto_triage: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Penetapan Wilayah Otomatis (Auto-Triage RT/RW)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Otomatis menetapkan rujukan pengaduan berdasarkan alamat domisili warga
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) =>
                    setSettings({ ...settings, maintenance_mode: e.target.checked })
                  }
                  className="w-4 h-4 text-amber-600 rounded border-slate-300"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Mode Pemeliharaan (Maintenance Mode)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Nonaktifkan pembuatan pengaduan baru sementara waktu saat pemeliharaan
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
