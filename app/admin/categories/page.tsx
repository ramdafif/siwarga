'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Modal } from '@/components/ui/Modal';
import { ComplaintCategory, SafeUser } from '@/lib/types';
import { Tag, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CategoriesPage() {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slaHours, setSlaHours] = useState('48');

  const fetchCats = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      setCurrentUser(uData.user);

      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon: 'Tag',
          sla_hours: parseInt(slaHours, 10) || 48,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setName('');
        setDescription('');
        fetchCats();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal menyimpan kategori.');
      }
    } catch {
      alert('Kendala jaringan.');
    }
  };

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              <span>Master Kategori Pengaduan</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Klasifikasi jenis pengaduan dan target Service Level Agreement (SLA) respon
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Categories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    SLA: {cat.sla_hours || 48} Jam
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {cat.description || 'Tidak ada keterangan'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Status: Aktif</span>
                <span className="font-mono">ID: {cat.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create Category */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Tambah Kategori Pengaduan"
          description="Kategori baru akan langsung muncul pada pilihan pengaduan warga."
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Penerangan Jalan & Fasum"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target SLA Penyelesaian (Jam)
              </label>
              <input
                type="number"
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                placeholder="48"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan / Ruang Lingkup
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan jenis-jenis masalah yang masuk ke dalam kategori ini..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                Simpan Kategori
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
