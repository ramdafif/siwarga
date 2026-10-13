'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Modal } from '@/components/ui/Modal';
import { RW, RT, SafeUser } from '@/lib/types';
import { Building2, Plus, Users, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';

export default function RegionsPage() {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [rws, setRws] = useState<RW[]>([]);
  const [rts, setRts] = useState<RT[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [rwModalOpen, setRwModalOpen] = useState(false);
  const [rtModalOpen, setRtModalOpen] = useState(false);

  // Forms
  const [rwNumber, setRwNumber] = useState('02');
  const [rwName, setRwName] = useState('RW 02 Harmoni');
  const [rwDesc, setRwDesc] = useState('');

  const [rtRwId, setRtRwId] = useState('');
  const [rtNumber, setRtNumber] = useState('04');
  const [rtLeader, setRtLeader] = useState('');
  const [rtPhone, setRtPhone] = useState('');

  const fetchRegions = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      setCurrentUser(uData.user);

      const res = await fetch('/api/regions');
      const data = await res.json();
      setRws(data.rws || []);
      setRts(data.rts || []);
      if (data.rws?.length > 0) setRtRwId(data.rws[0].id);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleCreateRW = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/regions/rw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: rwNumber, name: rwName, description: rwDesc }),
      });
      if (res.ok) {
        setRwModalOpen(false);
        fetchRegions();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal membuat RW.');
      }
    } catch {
      alert('Kendala jaringan.');
    }
  };

  const handleCreateRT = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/regions/rt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rw_id: rtRwId,
          number: rtNumber,
          leader_name: rtLeader,
          leader_phone: rtPhone,
        }),
      });
      if (res.ok) {
        setRtModalOpen(false);
        fetchRegions();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal membuat RT.');
      }
    } catch {
      alert('Kendala jaringan.');
    }
  };

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Struktur Wilayah Administrasi (RW & RT)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pengelolaan hierarki kepengurusan Rukun Warga dan Rukun Tetangga
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRwModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah RW</span>
            </button>
            <button
              onClick={() => setRtModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah RT</span>
            </button>
          </div>
        </div>

        {/* RW and RT Hierarchy Display */}
        <div className="space-y-6">
          {rws.map((rw) => {
            const childRts = rts.filter((rt) => rt.rw_id === rw.id);

            return (
              <div
                key={rw.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold">
                        RUKUN WARGA {rw.number}
                      </span>
                      <h2 className="text-lg font-bold text-white">{rw.name}</h2>
                    </div>
                    {rw.description && (
                      <p className="text-xs text-slate-300 mt-1">{rw.description}</p>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Total {childRts.length} Rukun Tetangga (RT)
                  </div>
                </div>

                {/* RT List within this RW */}
                <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {childRts.map((rt) => (
                    <div
                      key={rt.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-white hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          RT {rt.number}
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                          Aktif
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 pt-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{rt.leader_name || 'Ketua RT'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{rt.leader_phone || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Create RW */}
        <Modal
          isOpen={rwModalOpen}
          onClose={() => setRwModalOpen(false)}
          title="Tambah Rukun Warga (RW) Baru"
          description="Masukkan nomor dan nama identitas RW baru."
        >
          <form onSubmit={handleCreateRW} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor RW (2 Digit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={rwNumber}
                onChange={(e) => setRwNumber(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Wilayah RW <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={rwName}
                onChange={(e) => setRwName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan</label>
              <textarea
                rows={2}
                value={rwDesc}
                onChange={(e) => setRwDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRwModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Simpan RW
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Create RT */}
        <Modal
          isOpen={rtModalOpen}
          onClose={() => setRtModalOpen(false)}
          title="Tambah Rukun Tetangga (RT) Baru"
          description="Tambahkan unit RT ke dalam RW yang ditentukan."
        >
          <form onSubmit={handleCreateRT} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Induk RW <span className="text-rose-500">*</span>
              </label>
              <select
                value={rtRwId}
                onChange={(e) => setRtRwId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
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
                Nomor RT (2 Digit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={rtNumber}
                onChange={(e) => setRtNumber(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Ketua RT
              </label>
              <input
                type="text"
                value={rtLeader}
                onChange={(e) => setRtLeader(e.target.value)}
                placeholder="Contoh: Bpk. H. Rahmat"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon / WA Ketua RT
              </label>
              <input
                type="tel"
                value={rtPhone}
                onChange={(e) => setRtPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRtModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                Simpan RT
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
