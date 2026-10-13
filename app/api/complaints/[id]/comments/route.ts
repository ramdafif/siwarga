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

    const { content } = await req.json();
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Isi tanggapan tidak boleh kosong.' }, { status: 422 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const result = await ComplaintService.addComment(id, content.trim(), user, {
      ipAddress: ip,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true, comment: result.comment });
  } catch (err) {
    console.error('Add comment error:', err);
    return NextResponse.json({ error: 'Gagal menambahkan tanggapan.' }, { status: 500 });
  }
}
