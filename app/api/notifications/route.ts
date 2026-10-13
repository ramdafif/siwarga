import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = store.getNotificationsByUser(user.id);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Get notifications error:', err);
    return NextResponse.json({ error: 'Gagal memuat notifikasi.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    store.markAllNotificationsAsRead(user.id);
    return NextResponse.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui notifikasi.' }, { status: 500 });
  }
}
