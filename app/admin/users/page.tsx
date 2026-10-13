'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Modal } from '@/components/ui/Modal';
import { SafeUser, UserRole, UserStatus, RW, RT } from '@/lib/types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Shield,
  KeyRound,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function UsersManagementPage() {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [rws, setRws] = useState<RW[]>([]);
  const [rts, setRts] = useState<RT[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Create Form State
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    email: '',
    phone: '',
    role: 'WARGA' as UserRole,
    rw_id: '',
    rt_id: '',
    password: 'warga123',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      const uData = await uRes.json();
      setCurrentUser(uData.user);

      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);

      const regRes = await fetch('/api/regions');
      const regData = await regRes.json();
      setRws(regData.rws || []);
      setRts(regData.rts || []);

      if (regData.rws?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          rw_id: regData.rws[0].id,
          rt_id: regData.rts?.[0]?.id || '',
        }));
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: SafeUser) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionLabel = nextStatus === 'ACTIVE' ? 'mengaktifkan kembali' : 'menonaktifkan (suspend)';
    if (!confirm(`Apakah Anda yakin ingin ${actionLabel} akun ${user.name}?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        alert(`Kata sandi untuk ${selectedUser.name} berhasil diubah.`);
        setResetModalOpen(false);
        setNewPassword('');
        setSelectedUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setCreateModalOpen(false);
        setFormData({
          name: '',
          nik: '',
          email: '',
          phone: '',
          role: 'WARGA',
          rw_id: rws[0]?.id || '',
          rt_id: rts[0]?.id || '',
          password: 'warga123',
        });
        fetchUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal membuat user.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.masked_nik?.includes(search);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Manajemen Pengguna & Hak Akses (RBAC)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola data warga, pengurus RT/RW, status keaktifan akun, dan reset kata sandi
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </div>

        {/* Search & Role Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pengguna, email, atau NIK..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium"
          >
            <option value="">Semua Peran (Roles)</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN_RW">Admin RW</option>
            <option value="ADMIN_RT">Admin RT</option>
            <option value="KARANG_TARUNA">Karang Taruna</option>
            <option value="WARGA">Warga</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Nama & Kontak</th>
                  <th className="px-5 py-3.5">NIK (Masked)</th>
                  <th className="px-5 py-3.5">Peran (Role)</th>
                  <th className="px-5 py-3.5">Wilayah</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Memuat daftar pengguna...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Tidak ada pengguna yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900 block">{user.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {user.email}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {user.masked_phone || user.phone}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-600">
                        {user.masked_nik || user.nik}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'ADMIN_RW'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'ADMIN_RT'
                              ? 'bg-amber-100 text-amber-800'
                              : user.role === 'KARANG_TARUNA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {user.rw_id ? 'RW 01' : '-'} / {user.rt_id ? 'RT 01' : '-'}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{user.status}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setResetModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {user.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.status === 'ACTIVE'
                                  ? 'text-rose-500 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.status === 'ACTIVE' ? 'Suspend Akun' : 'Aktifkan Akun'}
                            >
                              {user.status === 'ACTIVE' ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create User */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Tambah Pengguna Baru"
          description="Daftarkan akun warga atau pengurus wilayah baru ke dalam sistem SIWARGA."
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIK (16 Digit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No HP / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Peran (Role Akses) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              >
                <option value="WARGA">Warga</option>
                <option value="ADMIN_RT">Admin RT (Ketua/Sekretaris RT)</option>
                <option value="ADMIN_RW">Admin RW (Pengurus RW)</option>
                <option value="KARANG_TARUNA">Admin Karang Taruna</option>
                {currentUser?.role === 'SUPER_ADMIN' && (
                  <option value="SUPER_ADMIN">Super Admin</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi Awal
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                {submitting ? 'Menyimpan...' : 'Simpan Pengguna'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Reset Password */}
        <Modal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title={`Reset Kata Sandi: ${selectedUser?.name}`}
          description="Masukkan kata sandi baru untuk akun ini."
        >
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
              >
                Simpan Kata Sandi
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
