import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses audit log terbatas untuk Super Admin.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('module') || undefined;
    const action = searchParams.get('action') || undefined;

    const logs = store.getAuditLogs({ module: moduleName, action });
    return NextResponse.json({ auditLogs: logs });
  } catch (err) {
    console.error('Audit logs error:', err);
    return NextResponse.json({ error: 'Gagal memuat log audit.' }, { status: 500 });
  }
}
