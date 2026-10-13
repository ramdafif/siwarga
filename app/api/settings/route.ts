import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function GET() {
  try {
    const config = store.getSystemConfig();
    return NextResponse.json({ config });
  } catch (err) {
    console.error('Get config error:', err);
    return NextResponse.json({ error: 'Gagal memuat konfigurasi sistem.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses terbatas untuk Super Admin.' }, { status: 403 });
    }

    const body = await req.json();
    const updated = store.updateSystemConfig(body);

    AuditService.log({
      user,
      action: 'UPDATE_SYSTEM_CONFIG',
      module: 'SYSTEM',
      recordId: 'sys-config',
      newValue: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (err) {
    console.error('Update config error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui konfigurasi sistem.' }, { status: 500 });
  }
}
