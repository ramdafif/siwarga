import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { ComplaintService } from '@/lib/services/complaintService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu.' }, { status: 401 });
    }

    const { target_role, target_user_id, target_user_name, instructions } = await req.json();

    if (!target_role) {
      return NextResponse.json({ error: 'Pihak tujuan disposisi wajib dipilih.' }, { status: 422 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const result = await ComplaintService.assign(
      id,
      target_role,
      target_user_id,
      target_user_name,
      instructions || 'Mohon segera ditindaklanjuti.',
      user,
      { ipAddress: ip, userAgent }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true, assignment: result.assignment });
  } catch (err) {
    console.error('Assign error:', err);
    return NextResponse.json({ error: 'Gagal membuat penugasan pengaduan.' }, { status: 500 });
  }
}
