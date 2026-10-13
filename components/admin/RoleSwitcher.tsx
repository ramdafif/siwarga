'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, ChevronDown, Check, Shield } from 'lucide-react';
import { SafeUser } from '@/lib/types';

interface RoleSwitcherProps {
  currentUser?: SafeUser | null;
  compact?: boolean;
}

const DEMO_ACCOUNTS = [
  {
    role: 'SUPER_ADMIN',
    name: 'Dr. Hendra Gunawan',
    title: 'Super Admin Wilayah',
    email: 'superadmin@siwarga.id',
    badge: 'Super Admin',
    desc: 'Akses penuh seluruh data, user, RW/RT, kategori, audit log',
  },
  {
    role: 'ADMIN_RW',
    name: 'H. Sudirman, S.E.',
    title: 'Ketua RW 01',
    email: 'rw01@siwarga.id',
    badge: 'Admin RW 01',
    desc: 'Pengawasan RW 01, verifikasi lintas RT, pengumuman RW',
  },
  {
    role: 'ADMIN_RT',
    name: 'Ahmad Fauzi',
    title: 'Ketua RT 01/RW 01',
    email: 'rt01.rw01@siwarga.id',
    badge: 'Admin RT 01',
    desc: 'Verifikasi warga RT 01, teruskan ke RW, tanggapan awal',
  },
  {
    role: 'KARANG_TARUNA',
    name: 'Rizky Pratama',
    title: 'Ketua Karang Taruna RW 01',
    email: 'karangtaruna.rw01@siwarga.id',
    badge: 'Karang Taruna',
    desc: 'Kegiatan kepemudaan, tugas lapangan, pengaduan pemuda',
  },
  {
    role: 'WARGA',
    name: 'Budi Santoso',
    title: 'Warga RT 01/RW 01',
    email: 'budi.santoso@warga.id',
    badge: 'Warga',
    desc: 'Buat pengaduan, unggah bukti, pantau status & notifikasi',
  },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentUser, compact = false }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSwitch = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: email }),
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
        // Force full refresh to clear server caches
        window.location.assign('/dashboard');
      }
    } catch (e) {
      console.error('Error switching role:', e);
    } finally {
      setLoading(false);
    }
  };

  const currentAccount = DEMO_ACCOUNTS.find((a) => a.email === currentUser?.email) || DEMO_ACCOUNTS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-800 font-medium ${
          compact
            ? 'px-2.5 py-1.5 rounded-lg text-xs'
            : 'px-3 py-2 rounded-xl text-xs sm:text-sm shadow-2xs'
        }`}
        title="Ganti Peran Pengguna (Demo RBAC)"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="truncate max-w-[130px] sm:max-w-[180px]">
          {currentUser ? `${currentAccount.badge}: ${currentUser.name.split(' ')[0]}` : 'Pilih Akun Demo'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Simulasi 5 Peran SIWARGA
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                  RBAC Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ganti peran seketika untuk menguji hak akses & alur pengaduan.
              </p>
            </div>

            <div className="space-y-1">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = currentUser?.email === acc.email;
                return (
                  <button
                    key={acc.email}
                    onClick={() => handleSwitch(acc.email)}
                    disabled={loading}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {acc.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            isSelected
                              ? 'bg-white/20 text-emerald-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {acc.badge}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {acc.desc}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
