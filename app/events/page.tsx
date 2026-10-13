'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Modal } from '@/components/ui/Modal';
import { Event, SafeUser } from '@/lib/types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function EventsPage() {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('08:00 WIB');
  const [location, setLocation] = useState('');
  const [quota, setQuota] = useState('50');
  const [submitting, setSubmitting] = useState(false);

  // Registration state
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>({});

  const fetchEvents = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      setCurrentUser(uData.user);

      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !eventDate || !location.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          event_date: eventDate,
          event_time: eventTime,
          location: location.trim(),
          quota: parseInt(quota, 10) || 50,
        }),
      });

      if (res.ok) {
        setCreateModalOpen(false);
        setName('');
        setDescription('');
        setEventDate('');
        setLocation('');
        fetchEvents();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal membuat kegiatan.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk mendaftar kegiatan.');
      return;
    }
    setRegisteringId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setRegisteredMap((prev) => ({ ...prev, [eventId]: true }));
        fetchEvents();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal mendaftar.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setRegisteringId(null);
    }
  };

  const canCreate =
    currentUser &&
    (currentUser.role === 'KARANG_TARUNA' ||
      currentUser.role === 'ADMIN_RW' ||
      currentUser.role === 'ADMIN_RT' ||
      currentUser.role === 'SUPER_ADMIN');

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Agenda & Kegiatan Masyarakat</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Program kepemudaan Karang Taruna, kerja bakti, posyandu, dan aktivitas warga RW 01
            </p>
          </div>

          {canCreate && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Kegiatan Baru</span>
            </button>
          )}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-xs text-slate-400">
              Memuat agenda kegiatan...
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              Belum ada kegiatan yang diagendakan.
            </div>
          ) : (
            events.map((evt) => {
              const isRegistered = registeredMap[evt.id];
              const isFull = Boolean(evt.quota && evt.registered_count >= evt.quota);

              return (
                <div
                  key={evt.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                        {evt.status}
                      </span>
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {evt.registered_count || 0} / {evt.quota || 50} Peserta
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3">{evt.name}</h3>
                    {evt.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{evt.event_date}</span>
                        <span>·</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{evt.event_time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Penyelenggara: <strong className="text-slate-700">{evt.organizer}</strong>
                    </span>

                    {isRegistered ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Terdaftar</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(evt.id)}
                        disabled={registeringId === evt.id || isFull}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                      >
                        {registeringId === evt.id
                          ? 'Mendaftar...'
                          : isFull
                          ? 'Kuota Penuh'
                          : 'Daftar Ikut'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal: Create Event */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Buat Kegiatan Baru"
          description="Publikasikan kegiatan kepemudaan atau lingkungan agar warga dapat mendaftar ikut serta."
        >
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kegiatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Turnamen Bulutangkis Pemuda RW 01"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Waktu Pelaksanaan
                </label>
                <input
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="08:00 WIB"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Kegiatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Balai Pertemuan RW 01"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kuota Maksimal Peserta
              </label>
              <input
                type="number"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                placeholder="50"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Kegiatan
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan tujuan kegiatan, syarat keikutsertaan, perlengkapan yang perlu dibawa..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
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
                {submitting ? 'Menyimpan...' : 'Simpan Kegiatan'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
