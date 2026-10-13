import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { canAccessComplaint } from '@/lib/auth/rbac';
import { maskPhone } from '@/lib/auth/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const complaint = store.getComplaintById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Pengaduan tidak ditemukan.' }, { status: 404 });
    }

    const user = getCurrentUserFromRequest(req);
    if (!user) {
      if (!complaint.is_public) {
        return NextResponse.json({ error: 'Akses terbatas untuk pengaduan privat.' }, { status: 401 });
      }
      // Anonymize phone for unauthenticated users
      return NextResponse.json({
        complaint: {
          ...complaint,
          reporter_phone: maskPhone(complaint.reporter_phone || ''),
        },
      });
    }

    if (!canAccessComplaint(user, complaint)) {
      return NextResponse.json({ error: 'Anda tidak memiliki hak akses untuk melihat pengaduan ini.' }, { status: 403 });
    }

    // Role-based privacy masking: only Super Admin, RW admin of this RW, RT admin of this RT, or the reporter themselves see raw phone
    const isPrivileged =
      user.role === 'SUPER_ADMIN' ||
      (user.role === 'ADMIN_RW' && complaint.rw_id === user.rw_id) ||
      (user.role === 'ADMIN_RT' && complaint.rt_id === user.rt_id) ||
      complaint.reporter_id === user.id;

    const safeComplaint = {
      ...complaint,
      reporter_phone: isPrivileged ? complaint.reporter_phone : maskPhone(complaint.reporter_phone || ''),
    };

    return NextResponse.json({ complaint: safeComplaint });
  } catch (err) {
    console.error('Get complaint detail error:', err);
    return NextResponse.json({ error: 'Gagal mengambil rincian pengaduan.' }, { status: 500 });
  }
}
