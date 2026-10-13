'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline';
import { Modal } from '@/components/ui/Modal';
import { Complaint, SafeUser, ComplaintStatus, UserRole } from '@/lib/types';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Paperclip,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  FileCheck,
  ArrowRightCircle,
  RotateCw,
  UserCheck,
  AlertCircle,
  Share2,
  Lock,
  Eye,
  FileText,
  Video,
} from 'lucide-react';

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const complaintId = resolvedParams.id;
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>('ACCEPTED');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('KARANG_TARUNA');
  const [instructions, setInstructions] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Image Preview Modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      const compRes = await fetch(`/api/complaints/${complaintId}`);
      const compData = await compRes.json();
      if (!compRes.ok) {
        setError(compData.error || 'Gagal memuat pengaduan.');
        setLoading(false);
        return;
      }
      setComplaint(compData.complaint);
    } catch {
      setError('Terjadi kendala jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [complaintId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/complaints/${complaintId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        setCommentText('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, notes: statusNotes }),
      });
      if (res.ok) {
        setStatusModalOpen(false);
        setStatusNotes('');
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal memperbarui status.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssign = async () => {
    setSubmittingAssign(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_role: targetRole,
          instructions,
        }),
      });
      if (res.ok) {
        setAssignModalOpen(false);
        setInstructions('');
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal membuat penugasan.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const openStatusChange = (status: ComplaintStatus, defaultNote = '') => {
    setTargetStatus(status);
    setStatusNotes(defaultNote);
    setStatusModalOpen(true);
  };

  if (loading) {
    return (
      <AppShell currentUser={currentUser}>
        <div className="py-20 text-center text-xs text-slate-400">
          Memuat rincian pengaduan...
        </div>
      </AppShell>
    );
  }

  if (error || !complaint) {
    return (
      <AppShell currentUser={currentUser}>
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-900">Tidak Dapat Mengakses Pengaduan</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'Pengaduan tidak ditemukan.'}</p>
          <Link
            href="/complaints"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  const role = currentUser?.role;
  const isReporter = currentUser?.id === complaint.reporter_id;
  const isRTAdmin = role === 'ADMIN_RT' && complaint.rt_id === currentUser?.rt_id;
  const isRWAdmin = role === 'ADMIN_RW' && complaint.rw_id === currentUser?.rw_id;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isKT = role === 'KARANG_TARUNA';

  return (
    <AppShell currentUser={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/complaints"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Pengaduan</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              #{complaint.ticket_number}
            </span>
          </div>
        </div>

        {/* Complaint Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          {/* Top metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                {complaint.category_name}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {complaint.is_public ? (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>{complaint.is_public ? 'Publik' : 'Privat'}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          {/* Title & Description */}
          <div className="mt-5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {complaint.title}
            </h1>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Location & Reporter details */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-500 block mb-1">Titik Lokasi Kejadian</span>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{complaint.address_location}</span>
              </p>
              <div className="mt-1 text-[11px] text-slate-500 font-mono">
                Wilayah: RT {complaint.rt_number || '01'} / RW {complaint.rw_number || '01'}
                {complaint.latitude && complaint.longitude && (
                  <span className="block mt-0.5">
                    Koordinat: {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-500 block mb-1">Informasi Pelapor</span>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{complaint.reporter_name || 'Warga'}</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500 font-mono">
                WhatsApp: {complaint.reporter_phone || '-'}
              </p>
            </div>
          </div>

          {/* Attachments Gallery */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-slate-500" />
                <span>Bukti Terlampir ({complaint.attachments.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {complaint.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    onClick={() => att.file_type === 'image' && setSelectedImage(att.file_url)}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="w-full h-24 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center mb-1.5">
                      {att.file_type === 'image' ? (
                        <img
                          src={att.file_url}
                          alt={att.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : att.file_type === 'video' ? (
                        <Video className="w-8 h-8 text-sky-600" />
                      ) : (
                        <FileText className="w-8 h-8 text-amber-600" />
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-800 truncate">
                      {att.file_name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(att.file_size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflow Action Bar (RBAC Controls) */}
          {(isRTAdmin || isRWAdmin || isSuperAdmin || isKT || isReporter) && (
            <div className="mt-8 pt-6 border-t border-slate-200/80 bg-slate-50/70 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 rounded-b-3xl">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aksi Alur Kerja Sesuai Hak Akses ({role})</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Status: {complaint.status}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* RT Admin Actions */}
                {(isRTAdmin || isSuperAdmin) && complaint.status === 'SUBMITTED' && (
                  <button
                    onClick={() =>
                      openStatusChange(
                        'VERIFICATION',
                        'Pengaduan sedang diverifikasi oleh Ketua RT setempat.'
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Mulai Verifikasi RT</span>
                  </button>
                )}

                {(isRTAdmin || isRWAdmin || isSuperAdmin) &&
                  (complaint.status === 'SUBMITTED' || complaint.status === 'VERIFICATION') && (
                    <>
                      <button
                        onClick={() =>
                          openStatusChange('ACCEPTED', 'Pengaduan telah diverifikasi valid dan diterima.')
                        }
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Terima Laporan</span>
                      </button>

                      <button
                        onClick={() =>
                          openStatusChange('REJECTED', 'Laporan tidak dapat diproses karena tidak memenuhi kriteria.')
                        }
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Tolak Laporan</span>
                      </button>
                    </>
                  )}

                {/* RT to RW Escalation */}
                {(isRTAdmin || isSuperAdmin) && complaint.status !== 'FORWARDED' && complaint.status !== 'RESOLVED' && (
                  <button
                    onClick={() =>
                      openStatusChange(
                        'FORWARDED',
                        'Diteruskan kepada Pengurus RW karena memerlukan koordinasi lintas RT / anggaran besar.'
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowRightCircle className="w-4 h-4" />
                    <span>Teruskan ke RW</span>
                  </button>
                )}

                {/* Assign / Disposisi (RW & Super Admin) */}
                {(isRWAdmin || isSuperAdmin || isRTAdmin) && (
                  <button
                    onClick={() => setAssignModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Disposisi Tugas (Karang Taruna/Satgas)</span>
                  </button>
                )}

                {/* In Progress */}
                {(isRWAdmin || isRTAdmin || isSuperAdmin || isKT) &&
                  complaint.status !== 'IN_PROGRESS' &&
                  complaint.status !== 'RESOLVED' && (
                    <button
                      onClick={() =>
                        openStatusChange('IN_PROGRESS', 'Petugas sedang menindaklanjuti perbaikan di lokasi.')
                      }
                      className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>Sedang Dikerjakan</span>
                    </button>
                  )}

                {/* Resolve */}
                {(isRWAdmin || isRTAdmin || isSuperAdmin || isKT) && complaint.status !== 'RESOLVED' && (
                  <button
                    onClick={() =>
                      openStatusChange(
                        'RESOLVED',
                        'Pekerjaan perbaikan telah selesai dilaksanakan dan dikonfirmasi tuntas.'
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tandai Selesai (Resolved)</span>
                  </button>
                )}

                {/* Reporter cancel */}
                {isReporter &&
                  (complaint.status === 'SUBMITTED' || complaint.status === 'DRAFT') && (
                    <button
                      onClick={() =>
                        openStatusChange('CANCELLED', 'Pengaduan dibatalkan atas permintaan pelapor.')
                      }
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-colors"
                    >
                      Batalkan Pengaduan Saya
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Status Timeline History */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-emerald-600" />
            <span>Alur & Rekam Jejak Status (Timeline)</span>
          </h2>
          <ComplaintTimeline history={complaint.history || []} />
        </div>

        {/* Discussion Thread & Official Comments */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Tanggapan Pengurus & Warga ({complaint.comments?.length || 0})</span>
          </h2>

          <div className="space-y-4 mb-6">
            {!complaint.comments || complaint.comments.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada tanggapan atau komentar pada pengaduan ini.
              </div>
            ) : (
              complaint.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-2xl border ${
                    comment.is_official
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {comment.user_name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          comment.is_official
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {comment.is_official ? `Pengurus (${comment.user_role})` : 'Warga'}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(comment.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          {currentUser ? (
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  role !== 'WARGA'
                    ? 'Tulis tanggapan resmi pengurus wilayah...'
                    : 'Tulis pertanyaan atau komentar tambahan...'
                }
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Kirim</span>
              </button>
            </form>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              Silakan{' '}
              <Link href="/login" className="text-emerald-700 font-semibold underline">
                masuk
              </Link>{' '}
              untuk memberikan komentar atau tanggapan.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Update Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Perbarui Status: ${targetStatus}`}
        description="Catatan pembaruan status akan tercatat pada riwayat linimasa pengaduan dan dikirim ke pelapor."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Alasan Perubahan Status <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Contoh: Telah diperiksa oleh pengurus RT. Petugas kebersihan akan membersihkan selokan besok pagi..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={updatingStatus}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
            >
              {updatingStatus ? 'Menyimpan...' : 'Konfirmasi Status'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Assign / Disposisi */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Disposisi Tugas Pengaduan"
        description="Tugaskan penanganan lapangan kepada Karang Taruna atau jajaran pengurus RT/RW."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tugaskan Kepada Pihak
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
            >
              <option value="KARANG_TARUNA">Karang Taruna (Kegiatan Pemuda/Sosial)</option>
              <option value="ADMIN_RT">Ketua RT Setempat</option>
              <option value="ADMIN_RW">Satgas Lingkungan RW</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instruksi Penanganan Khusus
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Contoh: Mohon kawan-kawan Karang Taruna berkoordinasi dengan warga untuk kerja bakti gotong royong di lokasi..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={submittingAssign}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              {submittingAssign ? 'Memproses...' : 'Kirim Disposisi'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Image Zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Preview Bukti"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </AppShell>
  );
}
