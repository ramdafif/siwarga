import { UserRole, SafeUser, Complaint, ComplaintStatus, User } from '../types';
import { sanitizeUser } from './session';

export type Permission =
  | 'GLOBAL_DASHBOARD'
  | 'MANAGE_USERS'
  | 'MANAGE_REGIONS'
  | 'MANAGE_CATEGORIES'
  | 'MANAGE_SETTINGS'
  | 'VIEW_AUDIT_LOGS'
  | 'VIEW_ALL_COMPLAINTS'
  | 'VIEW_RW_COMPLAINTS'
  | 'VIEW_RT_COMPLAINTS'
  | 'VIEW_ASSIGNED_KT_COMPLAINTS'
  | 'CREATE_COMPLAINT'
  | 'VERIFY_COMPLAINT'
  | 'ASSIGN_COMPLAINT'
  | 'CHANGE_COMPLAINT_STATUS'
  | 'COMMENT_COMPLAINT'
  | 'MANAGE_ANNOUNCEMENTS'
  | 'MANAGE_EVENTS'
  | 'VIEW_CITIZEN_LIST'
  | 'EXPORT_REPORTS';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'GLOBAL_DASHBOARD',
    'MANAGE_USERS',
    'MANAGE_REGIONS',
    'MANAGE_CATEGORIES',
    'MANAGE_SETTINGS',
    'VIEW_AUDIT_LOGS',
    'VIEW_ALL_COMPLAINTS',
    'CREATE_COMPLAINT',
    'VERIFY_COMPLAINT',
    'ASSIGN_COMPLAINT',
    'CHANGE_COMPLAINT_STATUS',
    'COMMENT_COMPLAINT',
    'MANAGE_ANNOUNCEMENTS',
    'MANAGE_EVENTS',
    'VIEW_CITIZEN_LIST',
    'EXPORT_REPORTS',
  ],
  ADMIN_RW: [
    'VIEW_RW_COMPLAINTS',
    'CREATE_COMPLAINT',
    'VERIFY_COMPLAINT',
    'ASSIGN_COMPLAINT',
    'CHANGE_COMPLAINT_STATUS',
    'COMMENT_COMPLAINT',
    'MANAGE_ANNOUNCEMENTS',
    'MANAGE_EVENTS',
    'VIEW_CITIZEN_LIST',
    'EXPORT_REPORTS',
  ],
  ADMIN_RT: [
    'VIEW_RT_COMPLAINTS',
    'CREATE_COMPLAINT',
    'VERIFY_COMPLAINT',
    'ASSIGN_COMPLAINT',
    'CHANGE_COMPLAINT_STATUS',
    'COMMENT_COMPLAINT',
    'MANAGE_ANNOUNCEMENTS',
    'VIEW_CITIZEN_LIST',
    'EXPORT_REPORTS',
  ],
  KARANG_TARUNA: [
    'VIEW_ASSIGNED_KT_COMPLAINTS',
    'CREATE_COMPLAINT',
    'COMMENT_COMPLAINT',
    'MANAGE_ANNOUNCEMENTS',
    'MANAGE_EVENTS',
  ],
  WARGA: [
    'CREATE_COMPLAINT',
    'COMMENT_COMPLAINT',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function canAccessComplaint(user: SafeUser, complaint: Complaint): boolean {
  if (user.role === 'SUPER_ADMIN') return true;

  if (user.role === 'ADMIN_RW') {
    return complaint.rw_id === user.rw_id;
  }

  if (user.role === 'ADMIN_RT') {
    return complaint.rt_id === user.rt_id;
  }

  if (user.role === 'KARANG_TARUNA') {
    // Can access if assigned to KT or if public in their RW
    const isAssigned = complaint.assignments?.some(
      (a) => a.assigned_to_role === 'KARANG_TARUNA' || a.assigned_to_user_id === user.id
    );
    return isAssigned || (complaint.rw_id === user.rw_id && complaint.is_public);
  }

  // WARGA: Can only access if they are the reporter OR complaint is marked public
  return complaint.reporter_id === user.id || complaint.is_public;
}

export function canModifyComplaintStatus(
  user: SafeUser,
  complaint: Complaint,
  targetStatus: ComplaintStatus
): { allowed: boolean; reason?: string } {
  if (user.role === 'SUPER_ADMIN') return { allowed: true };

  if (user.role === 'ADMIN_RW') {
    if (complaint.rw_id !== user.rw_id) {
      return { allowed: false, reason: 'Pengaduan berada di luar wilayah RW Anda.' };
    }
    return { allowed: true };
  }

  if (user.role === 'ADMIN_RT') {
    if (complaint.rt_id !== user.rt_id) {
      return { allowed: false, reason: 'Pengaduan berada di luar wilayah RT Anda.' };
    }
    // RT can verify, accept, reject, mark need more info, forward to RW, or resolve within RT scope
    return { allowed: true };
  }

  if (user.role === 'KARANG_TARUNA') {
    // Only can update status if assigned to KT
    const isAssigned = complaint.assignments?.some(
      (a) => a.assigned_to_role === 'KARANG_TARUNA' || a.assigned_to_user_id === user.id
    );
    if (!isAssigned) {
      return { allowed: false, reason: 'Pengaduan belum ditugaskan kepada Karang Taruna.' };
    }
    if (targetStatus === 'IN_PROGRESS' || targetStatus === 'RESOLVED') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Peran Karang Taruna hanya dapat memperbarui ke Sedang Diproses atau Selesai.' };
  }

  if (user.role === 'WARGA') {
    if (complaint.reporter_id !== user.id) {
      return { allowed: false, reason: 'Anda bukan pembuat pengaduan ini.' };
    }
    // Warga can only cancel their own submitted draft/pending complaint
    if (targetStatus === 'CANCELLED' && (complaint.status === 'DRAFT' || complaint.status === 'SUBMITTED')) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Warga tidak memiliki izin mengubah status ke tahapan ini.' };
  }

  return { allowed: false, reason: 'Akses ditolak.' };
}

export function filterComplaintsByRole(complaints: Complaint[], user: SafeUser): Complaint[] {
  if (user.role === 'SUPER_ADMIN') return complaints;

  if (user.role === 'ADMIN_RW') {
    return complaints.filter((c) => c.rw_id === user.rw_id);
  }

  if (user.role === 'ADMIN_RT') {
    return complaints.filter((c) => c.rt_id === user.rt_id);
  }

  if (user.role === 'KARANG_TARUNA') {
    return complaints.filter((c) => {
      const isAssigned = c.assignments?.some(
        (a) => a.assigned_to_role === 'KARANG_TARUNA' || a.assigned_to_user_id === user.id
      );
      return isAssigned || (c.rw_id === user.rw_id && c.is_public);
    });
  }

  // Warga: only own complaints unless public
  return complaints.filter((c) => c.reporter_id === user.id || c.is_public);
}

export function filterUsersByRole(users: User[], viewer: SafeUser): SafeUser[] {
  if (viewer.role === 'SUPER_ADMIN') {
    return users.map((u) => sanitizeUser(u, viewer.role));
  }

  if (viewer.role === 'ADMIN_RW') {
    return users
      .filter((u) => u.rw_id === viewer.rw_id && u.role !== 'SUPER_ADMIN')
      .map((u) => sanitizeUser(u, viewer.role));
  }

  if (viewer.role === 'ADMIN_RT') {
    return users
      .filter((u) => u.rt_id === viewer.rt_id && u.role === 'WARGA')
      .map((u) => sanitizeUser(u, viewer.role));
  }

  return [];
}
