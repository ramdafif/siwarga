'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquarePlus,
  Inbox,
  Megaphone,
  Calendar,
  BarChart3,
  Users,
  MapPin,
  FolderTree,
  ShieldAlert,
  Settings,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import { SafeUser } from '@/lib/types';

interface SidebarProps {
  currentUser?: SafeUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, isOpen, onClose }) => {
  const pathname = usePathname();
  const role = currentUser?.role || 'WARGA';

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [];

  // Common main section
  sections.push({
    title: 'Navigasi Utama',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Semua Pengaduan', href: '/complaints', icon: Inbox },
      { label: 'Buat Pengaduan', href: '/complaints/create', icon: MessageSquarePlus },
    ],
  });

  // Warga specific
  if (role === 'WARGA') {
    sections.push({
      title: 'Aktivitas Warga',
      items: [
        { label: 'Pengaduan Saya', href: '/complaints?my=true', icon: User },
        { label: 'Pengumuman Wilayah', href: '/announcements', icon: Megaphone },
        { label: 'Kegiatan Warga', href: '/events', icon: Calendar },
      ],
    });
  }

  // Admin RT & RW
  if (role === 'ADMIN_RT' || role === 'ADMIN_RW') {
    sections.push({
      title: role === 'ADMIN_RT' ? 'Manajemen RT' : 'Manajemen RW',
      items: [
        { label: 'Data Warga', href: '/admin/users', icon: Users },
        { label: 'Pengumuman', href: '/announcements', icon: Megaphone },
        { label: 'Kegiatan Masyarakat', href: '/events', icon: Calendar },
        { label: 'Laporan & Statistik', href: '/reports', icon: BarChart3 },
      ],
    });
  }

  // Karang Taruna
  if (role === 'KARANG_TARUNA') {
    sections.push({
      title: 'Program Pemuda',
      items: [
        { label: 'Kegiatan Kepemudaan', href: '/events', icon: Calendar },
        { label: 'Pengumuman Pemuda', href: '/announcements', icon: Megaphone },
      ],
    });
  }

  // Super Admin
  if (role === 'SUPER_ADMIN') {
    sections.push({
      title: 'Pusat Kontrol Wilayah',
      items: [
        { label: 'Kelola Pengguna & Role', href: '/admin/users', icon: Users },
        { label: 'Struktur RW / RT', href: '/admin/regions', icon: MapPin },
        { label: 'Master Kategori', href: '/admin/categories', icon: FolderTree },
        { label: 'Pengumuman Global', href: '/announcements', icon: Megaphone },
        { label: 'Kegiatan Wilayah', href: '/events', icon: Calendar },
        { label: 'Laporan Komprehensif', href: '/reports', icon: BarChart3 },
        { label: 'Audit Trail & Log', href: '/admin/audit-logs', icon: ShieldAlert },
        { label: 'Konfigurasi Sistem', href: '/admin/settings', icon: Settings },
      ],
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              SW
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                SIWARGA
              </span>
              <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
                Portal Warga & RT/RW
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Badge Card */}
        {currentUser && (
          <div className="mx-4 mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-400 font-mono">
                  <span>{currentUser.role.replace('_', ' ')}</span>
                  {currentUser.rt_id && <span>· RT 01</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h4>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
          <p className="font-medium text-slate-400">SIWARGA v1.0 Production</p>
          <p className="mt-0.5">Wilayah Gandaria Selatan</p>
        </div>
      </aside>
    </>
  );
};
