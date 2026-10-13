'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Modal } from '@/components/ui/Modal';
import { Announcement, SafeUser } from '@/lib/types';
import { Megaphone, Plus, Calendar, User, Trash2, Globe, Building2, MapPin } from 'lucide-react';

export default function AnnouncementsPage() {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'RW' | 'RT' | 'KARANG_TARUNA'>('ALL');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      setCurrentUser(uData.user);

      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          target_audience: targetAudience,
        }),
      });

      if (res.ok) {
        setCreateModalOpen(false);
        setTitle('');
        setContent('');
        fetchAnnouncements();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal membuat pengumuman.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAnnouncements();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const canCreate = currentUser && currentUser.role !== 'WARGA';

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              <span>Papan Pengumuman Wilayah</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Informasi resmi dari jajaran Pengurus RW 01, Ketua RT, dan Karang Taruna
            </p>
          </div>

          {canCreate && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengumuman Baru</span>
            </button>
          )}
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Memuat pengumuman wilayah...
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              Belum ada pengumuman yang dipublikasikan.
            </div>
          ) : (
            announcements.map((ann) => {
              const isAuthor = currentUser?.id === ann.author_id || currentUser?.role === 'SUPER_ADMIN';

              return (
                <div
                  key={ann.id}
                  className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                        {ann.target_audience === 'ALL'
                          ? 'Seluruh Warga'
                          : ann.target_audience === 'KARANG_TARUNA'
                          ? 'Karang Taruna'
                          : `Wilayah ${ann.target_audience}`}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(ann.publish_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors self-end sm:self-auto"
                        title="Hapus pengumuman"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">{ann.author_name}</span>
                      <span>·</span>
                      <span className="text-[11px] font-mono text-emerald-700">
                        {ann.author_role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal: Create Announcement */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Buat Pengumuman Baru"
          description="Pengumuman akan langsung disiarkan ke portal dan dikirimkan sebagai notifikasi kepada warga."
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Pengumuman <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Jadwal Kerja Bakti Serentak Menyambut Musim Hujan"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Sasaran Warga
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              >
                <option value="ALL">Semua Warga (Lingkup Wilayah)</option>
                <option value="RW">Warga se-RW 01</option>
                <option value="RT">Warga RT Saja</option>
                <option value="KARANG_TARUNA">Anggota Karang Taruna</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Isi Pengumuman Lengkap <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan detail pengumuman, tanggal pelaksanaan, waktu kumpul, dan hal-hal yang perlu disiapkan oleh warga..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                {submitting ? 'Menerbitkan...' : 'Terbitkan Pengumuman'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
