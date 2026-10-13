'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Notification, SafeUser } from '@/lib/types';
import { Bell, CheckCheck, Clock, ExternalLink, Inbox } from 'lucide-react';

export default function NotificationsPage() {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      setCurrentUser(uData.user);

      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' });
      if (res.ok) {
        fetchNotifs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <span>Notifikasi & Pemberitahuan</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pemberitahuan perubahan status pengaduan, pengumuman wilayah, dan disposisi
            </p>
          </div>

          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-colors shrink-0"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Memuat notifikasi...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p>Tidak ada pemberitahuan baru.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all ${
                  n.is_read
                    ? 'bg-white border-slate-200'
                    : 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{n.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {(n.link || n.reference_url) && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                    <Link
                      href={n.link || n.reference_url || '#'}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>Lihat Rincian</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
