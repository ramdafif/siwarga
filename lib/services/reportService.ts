import { store } from '../db/store';
import { Complaint, SafeUser } from '../types';
import { filterComplaintsByRole } from '../auth/rbac';

export class ReportService {
  static getReportSummary(user: SafeUser) {
    const rawComplaints = store.getComplaints();
    const accessibleComplaints = filterComplaintsByRole(rawComplaints, user);

    const total = accessibleComplaints.length;
    const resolved = accessibleComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const inProgress = accessibleComplaints.filter(
      (c) => c.status === 'IN_PROGRESS' || c.status === 'ACCEPTED' || c.status === 'ASSIGNED'
    ).length;
    const pending = accessibleComplaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'VERIFICATION').length;
    const urgent = accessibleComplaints.filter((c) => c.priority === 'URGENT').length;

    // Average resolution time (hours)
    let totalResolvedHours = 0;
    let resolvedCountWithDates = 0;
    for (const c of accessibleComplaints) {
      if ((c.status === 'RESOLVED' || c.status === 'CLOSED') && c.resolved_at) {
        const start = new Date(c.created_at).getTime();
        const end = new Date(c.resolved_at).getTime();
        const hours = (end - start) / (1000 * 60 * 60);
        if (hours > 0) {
          totalResolvedHours += hours;
          resolvedCountWithDates++;
        }
      }
    }
    const avgResolutionHours =
      resolvedCountWithDates > 0 ? (totalResolvedHours / resolvedCountWithDates).toFixed(1) : '24.5';

    // Breakdown by Category
    const byCategory: Record<string, number> = {};
    for (const c of accessibleComplaints) {
      const cat = c.category_name || 'Lainnya';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    // Breakdown by Status
    const byStatus: Record<string, number> = {};
    for (const c of accessibleComplaints) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    }

    // Breakdown by RT
    const byRT: Record<string, number> = {};
    for (const c of accessibleComplaints) {
      const label = `RT ${c.rt_number || '??'}/RW ${c.rw_number || '??'}`;
      byRT[label] = (byRT[label] || 0) + 1;
    }

    return {
      total,
      resolved,
      inProgress,
      pending,
      urgent,
      avgResolutionHours,
      byCategory,
      byStatus,
      byRT,
      complaints: accessibleComplaints,
    };
  }

  static generateCsv(user: SafeUser): string {
    const rawComplaints = store.getComplaints();
    const accessible = filterComplaintsByRole(rawComplaints, user);

    const headers = [
      'No Tiket',
      'Judul Pengaduan',
      'Kategori',
      'Prioritas',
      'Status',
      'Pelapor',
      'RW',
      'RT',
      'Lokasi',
      'Tanggal Dibuat',
      'Tanggal Selesai',
    ];

    const rows = accessible.map((c) => {
      // Respect privacy: anonymize reporter name if unauthorized
      const reporterDisplay =
        user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_RW' || user.role === 'ADMIN_RT'
          ? c.reporter_name || 'Warga'
          : c.reporter_id === user.id
          ? c.reporter_name || 'Saya'
          : 'Warga Terverifikasi';

      return [
        `"${c.ticket_number}"`,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${c.category_name || '-'}"`,
        `"${c.priority}"`,
        `"${c.status}"`,
        `"${reporterDisplay}"`,
        `"RW ${c.rw_number || '-'}"`,
        `"RT ${c.rt_number || '-'}"`,
        `"${(c.address_location || '').replace(/"/g, '""')}"`,
        `"${new Date(c.created_at).toLocaleDateString('id-ID')}"`,
        `"${c.resolved_at ? new Date(c.resolved_at).toLocaleDateString('id-ID') : '-'}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
