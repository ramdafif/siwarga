import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ann = store.getAnnouncementById(id);
    if (!ann) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ announcement: ann });
  } catch (err) {
    console.error('Get announcement error:', err);
    return NextResponse.json({ error: 'Gagal memuat rincian pengumuman.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu.' }, { status: 401 });
    }

    const ann = store.getAnnouncementById(id);
    if (!ann) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan.' }, { status: 404 });
    }

    if (user.role !== 'SUPER_ADMIN' && ann.author_id !== user.id) {
      return NextResponse.json({ error: 'Anda tidak memiliki hak menghapus pengumuman ini.' }, { status: 403 });
    }

    store.deleteAnnouncement(id);

    AuditService.log({
      user,
      action: 'DELETE_ANNOUNCEMENT',
      module: 'ANNOUNCEMENT',
      recordId: id,
      oldValue: ann.title,
    });

    return NextResponse.json({ success: true, message: 'Pengumuman berhasil dihapus.' });
  } catch (err) {
    console.error('Delete announcement error:', err);
    return NextResponse.json({ error: 'Gagal menghapus pengumuman.' }, { status: 500 });
  }
}
