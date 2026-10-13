import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu.' }, { status: 401 });
    }

    const event = store.getEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan.' }, { status: 404 });
    }

    if (event.quota && event.registered_count >= event.quota) {
      return NextResponse.json({ error: 'Mohon maaf, kuota kegiatan ini telah penuh.' }, { status: 400 });
    }

    const { notes } = await req.json().catch(() => ({ notes: '' }));

    const success = store.registerEventParticipant(
      id,
      { id: user.id, name: user.name, phone: user.phone },
      notes
    );

    if (!success) {
      return NextResponse.json({ error: 'Gagal mendaftar kegiatan.' }, { status: 500 });
    }

    AuditService.log({
      user,
      action: 'REGISTER_EVENT',
      module: 'EVENT',
      recordId: id,
      newValue: `Pendaftaran peserta kegiatan: ${event.name}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil! Sampai jumpa di kegiatan masyarakat.',
    });
  } catch (err) {
    console.error('Register event error:', err);
    return NextResponse.json({ error: 'Gagal mendaftar kegiatan.' }, { status: 500 });
  }
}
