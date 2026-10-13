import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = store.markNotificationAsRead(id);
    return NextResponse.json({ success });
  } catch (err) {
    console.error('Mark read error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui status notifikasi.' }, { status: 500 });
  }
}
