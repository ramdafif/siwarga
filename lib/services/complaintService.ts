import { store } from '../db/store';
import {
  Complaint,
  ComplaintPriority,
  ComplaintStatus,
  SafeUser,
  UserRole,
  ComplaintComment,
  ComplaintAssignment,
} from '../types';
import { canAccessComplaint, canModifyComplaintStatus } from '../auth/rbac';
import { NotificationGateway } from './notificationService';
import { AuditService } from './auditService';

export class ComplaintService {
  static async create(
    data: {
      title: string;
      description: string;
      category_id: string;
      priority?: ComplaintPriority;
      rw_id: string;
      rt_id: string;
      address_location: string;
      latitude?: number;
      longitude?: number;
      is_public?: boolean;
      attachments?: Array<{
        file_name: string;
        file_url: string;
        file_type: 'image' | 'video' | 'document';
        file_size: number;
      }>;
    },
    user: SafeUser,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<Complaint> {
    const category = store.getCategoryById(data.category_id);
    const rw = store.getRWById(data.rw_id);
    const rt = store.getRTById(data.rt_id);

    const attachments = (data.attachments || []).map((att, i) => ({
      id: `att-${Date.now()}-${i}`,
      complaint_id: '',
      ...att,
      created_at: new Date().toISOString(),
    }));

    const complaint = store.createComplaint({
      title: data.title,
      description: data.description,
      category_id: data.category_id,
      category_name: category ? category.name : 'Umum',
      priority: data.priority || 'MEDIUM',
      status: 'SUBMITTED',
      reporter_id: user.id,
      reporter_name: user.name,
      reporter_phone: user.phone,
      rw_id: data.rw_id,
      rt_id: data.rt_id,
      rw_number: rw ? rw.number : '',
      rt_number: rt ? rt.number : '',
      address_location: data.address_location,
      latitude: data.latitude,
      longitude: data.longitude,
      is_public: data.is_public ?? true,
      attachments,
    });

    // Notify RT Admin
    const rtAdmins = store.getUsers().filter((u) => u.rt_id === data.rt_id && u.role === 'ADMIN_RT');
    for (const rtAdmin of rtAdmins) {
      await NotificationGateway.sendInternal({
        userId: rtAdmin.id,
        title: `Pengaduan Baru di RT ${rt?.number || ''}`,
        message: `Warga ${user.name} melaporkan: "${data.title}"`,
        type: 'COMPLAINT_STATUS',
        referenceId: complaint.id,
        referenceUrl: `/complaints/${complaint.id}`,
      });
    }

    // Audit Log
    AuditService.log({
      user,
      action: 'CREATE_COMPLAINT',
      module: 'COMPLAINT',
      recordId: complaint.id,
      newValue: JSON.stringify({
        ticket: complaint.ticket_number,
        title: complaint.title,
        priority: complaint.priority,
      }),
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return complaint;
  }

  static async updateStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    notes: string,
    user: SafeUser,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; complaint?: Complaint; error?: string }> {
    const complaint = store.getComplaintById(complaintId);
    if (!complaint) {
      return { success: false, error: 'Pengaduan tidak ditemukan.' };
    }

    const check = canModifyComplaintStatus(user, complaint, newStatus);
    if (!check.allowed) {
      return { success: false, error: check.reason || 'Anda tidak berhak mengubah status pengaduan ini.' };
    }

    const prevStatus = complaint.status;
    const updated = store.updateComplaintStatus(
      complaintId,
      newStatus,
      { id: user.id, name: user.name, role: user.role },
      notes || `Status diubah menjadi ${newStatus}`
    );

    if (!updated) {
      return { success: false, error: 'Gagal memperbarui status.' };
    }

    // Notify Reporter (Warga)
    if (updated.reporter_id) {
      await NotificationGateway.sendInternal({
        userId: updated.reporter_id,
        title: `Status Pengaduan #${updated.ticket_number} Diperbarui`,
        message: `Pengaduan "${updated.title}" kini berstatus: ${newStatus}. Catatan: ${notes || '-'}`,
        type: 'COMPLAINT_STATUS',
        referenceId: updated.id,
        referenceUrl: `/complaints/${updated.id}`,
      });
    }

    // Audit Log
    AuditService.log({
      user,
      action: 'UPDATE_COMPLAINT_STATUS',
      module: 'COMPLAINT',
      recordId: updated.id,
      oldValue: prevStatus,
      newValue: newStatus,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { success: true, complaint: updated };
  }

  static async addComment(
    complaintId: string,
    content: string,
    user: SafeUser,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; comment?: ComplaintComment; error?: string }> {
    const complaint = store.getComplaintById(complaintId);
    if (!complaint) {
      return { success: false, error: 'Pengaduan tidak ditemukan.' };
    }

    if (!canAccessComplaint(user, complaint)) {
      return { success: false, error: 'Anda tidak memiliki hak akses terhadap pengaduan ini.' };
    }

    const isOfficial = user.role !== 'WARGA';
    const comment = store.addComplaintComment(
      complaintId,
      { id: user.id, name: user.name, role: user.role },
      content,
      isOfficial
    );

    if (!comment) {
      return { success: false, error: 'Gagal menambahkan tanggapan.' };
    }

    // If comment is from official, notify reporter
    if (isOfficial && complaint.reporter_id && complaint.reporter_id !== user.id) {
      await NotificationGateway.sendInternal({
        userId: complaint.reporter_id,
        title: `Tanggapan Baru dari Pengurus (${user.name})`,
        message: `Tanggapan pada #${complaint.ticket_number}: "${content.substring(0, 70)}..."`,
        type: 'COMPLAINT_COMMENT',
        referenceId: complaint.id,
        referenceUrl: `/complaints/${complaint.id}`,
      });
    }

    // If comment is from reporter, notify RT/RW
    if (!isOfficial) {
      const rtAdmins = store.getUsers().filter((u) => u.rt_id === complaint.rt_id && u.role === 'ADMIN_RT');
      for (const admin of rtAdmins) {
        await NotificationGateway.sendInternal({
          userId: admin.id,
          title: `Tanggapan Warga pada #${complaint.ticket_number}`,
          message: `${user.name} memberikan komentar baru: "${content.substring(0, 70)}..."`,
          type: 'COMPLAINT_COMMENT',
          referenceId: complaint.id,
          referenceUrl: `/complaints/${complaint.id}`,
        });
      }
    }

    // Audit Log
    AuditService.log({
      user,
      action: 'ADD_COMPLAINT_COMMENT',
      module: 'COMPLAINT',
      recordId: complaint.id,
      newValue: content.substring(0, 100),
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { success: true, comment };
  }

  static async assign(
    complaintId: string,
    targetRole: UserRole,
    targetUserId: string | undefined,
    targetUserName: string | undefined,
    instructions: string,
    user: SafeUser,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; assignment?: ComplaintAssignment; error?: string }> {
    const complaint = store.getComplaintById(complaintId);
    if (!complaint) {
      return { success: false, error: 'Pengaduan tidak ditemukan.' };
    }

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_RW' && user.role !== 'ADMIN_RT') {
      return { success: false, error: 'Hanya pengurus yang dapat menugaskan pengaduan.' };
    }

    const assignment = store.assignComplaint(
      complaintId,
      { id: user.id, name: user.name },
      {
        assigned_to_role: targetRole,
        assigned_to_user_id: targetUserId,
        assigned_to_user_name: targetUserName,
        instructions,
      }
    );

    if (!assignment) {
      return { success: false, error: 'Gagal membuat penugasan.' };
    }

    // Also record status change to ASSIGNED
    store.updateComplaintStatus(
      complaintId,
      'ASSIGNED',
      { id: user.id, name: user.name, role: user.role },
      `Disposisi ditugaskan ke ${targetRole}${targetUserName ? ` (${targetUserName})` : ''}: ${instructions}`
    );

    // Notify assigned user if specific
    if (targetUserId) {
      await NotificationGateway.sendInternal({
        userId: targetUserId,
        title: `Tugas Pengaduan Baru #${complaint.ticket_number}`,
        message: `Anda ditugaskan menangani pengaduan: "${complaint.title}". Instruksi: ${instructions}`,
        type: 'COMPLAINT_ASSIGNED',
        referenceId: complaint.id,
        referenceUrl: `/complaints/${complaint.id}`,
      });
    }

    // Audit Log
    AuditService.log({
      user,
      action: 'ASSIGN_COMPLAINT',
      module: 'COMPLAINT',
      recordId: complaint.id,
      newValue: JSON.stringify({ targetRole, targetUserId, instructions }),
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { success: true, assignment };
  }
}
