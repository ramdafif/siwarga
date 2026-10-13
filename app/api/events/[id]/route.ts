import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = store.getEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan.' }, { status: 404 });
    }

    const user = getCurrentUserFromRequest(req);
    const isRegistered = user ? store.isUserRegisteredForEvent(id, user.id) : false;

    return NextResponse.json({ event, isRegistered });
  } catch (err) {
    console.error('Get event error:', err);
    return NextResponse.json({ error: 'Gagal memuat kegiatan.' }, { status: 500 });
  }
}
