import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { ComplaintService } from '@/lib/services/complaintService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap masuk (login) terlebih dahulu.' }, { status: 401 });
    }

    const body = await req.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status baru wajib ditentukan.' }, { status: 422 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const result = await ComplaintService.updateStatus(id, status, notes || '', user, {
      ipAddress: ip,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true, complaint: result.complaint });
  } catch (err) {
    console.error('Update status error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui status pengaduan.' }, { status: 500 });
  }
}
