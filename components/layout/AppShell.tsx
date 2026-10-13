'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SafeUser } from '@/lib/types';
import Link from 'next/link';
import { LayoutDashboard, MessageSquarePlus, Bell, User, Inbox } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface AppShellProps {
  children: React.ReactNode;
  currentUser?: SafeUser | null;
}

export const AppShell: React.FC<AppShellProps> = ({ children, currentUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const mobileNav = [
    { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pengaduan', href: '/complaints', icon: Inbox },
    { label: 'Lapor', href: '/complaints/create', icon: MessageSquarePlus, highlight: true },
    { label: 'Notifikasi', href: '/notifications', icon: Bell },
    { label: 'Profil', href: currentUser ? '/profile' : '/login', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex">
        {/* Role-based Sidebar */}
        <Sidebar
          currentUser={currentUser}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-16 lg:pb-8">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
