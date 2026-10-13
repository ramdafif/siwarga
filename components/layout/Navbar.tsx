'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { SafeUser, Notification } from '@/lib/types';
import { RoleSwitcher } from '../admin/RoleSwitcher';

interface NavbarProps {
  currentUser?: SafeUser | null;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onToggleSidebar }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Ignore
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      // Fallback
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/complaints', label: 'Pengaduan' },
    { href: '/announcements', label: 'Pengumuman' },
    { href: '/events', label: 'Kegiatan' },
    ...(currentUser && currentUser.role !== 'WARGA'
      ? [{ href: '/reports', label: 'Laporan' }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs group-hover:bg-emerald-800 transition-colors">
              SW
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                SIWARGA
              </span>
            </div>
          </Link>
        </div>

        {/* Zone 2: Clean 4-6 Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
                  isActive ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700 pb-1' : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Demo Switcher, Notifications, User Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick RBAC Role Switcher */}
          <RoleSwitcher currentUser={currentUser} />

          {/* Notifications Bell */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Pemberitahuan"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-800">
                        Notifikasi ({unreadCount} baru)
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Tandai sudah dibaca
                        </button>
                      )}
                    </div>

                    <div className="mt-2 max-h-80 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          Belum ada pemberitahuan baru.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <Link
                            key={notif.id}
                            href={notif.reference_url || '/notifications'}
                            onClick={() => setShowNotifMenu(false)}
                            className={`block p-2.5 rounded-xl transition-colors text-left ${
                              notif.is_read
                                ? 'bg-white hover:bg-slate-50'
                                : 'bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100'
                            }`}
                          >
                            <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              ·{' '}
                              {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                      <Link
                        href="/notifications"
                        onClick={() => setShowNotifMenu(false)}
                        className="text-xs text-emerald-700 hover:underline font-medium"
                      >
                        Lihat semua notifikasi
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Profile / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Menu akun"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {currentUser.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700">
                        <span>{currentUser.role.replace('_', ' ')}</span>
                        {currentUser.rw_id && <span>· RW 01</span>}
                        {currentUser.rt_id && <span>· RT 01</span>}
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <Link
                        href="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        Profil & Keamanan
                      </Link>

                      {currentUser.role === 'SUPER_ADMIN' && (
                        <Link
                          href="/admin/users"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Layers className="w-4 h-4 text-slate-500" />
                          Panel Super Admin
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Keluar (Logout)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Daftar Warga
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
