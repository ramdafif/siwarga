import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';
import { NotificationGateway } from '@/lib/services/notificationService';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const audience = searchParams.get('audience') || undefined;

    const list = store.getAnnouncements({
      rw_id: user?.rw_id,
      rt_id: user?.rt_id,
      audience,
    });

    return NextResponse.json({ announcements: list });
  } catch (err) {
    console.error('Get announcements error:', err);
    return NextResponse.json({ error: 'Gagal memuat pengumuman.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu.' }, { status: 401 });
    }

    if (user.role === 'WARGA') {
      return NextResponse.json({ error: 'Warga tidak memiliki hak membuat pengumuman.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, target_audience, rw_id, rt_id, expired_date } = body;

    if (!title || title.trim().length < 5) {
      return NextResponse.json({ error: 'Judul pengumuman minimal 5 karakter.' }, { status: 422 });
    }
    if (!content || content.trim().length < 15) {
      return NextResponse.json({ error: 'Isi pengumuman minimal 15 karakter.' }, { status: 422 });
    }

    const rw = store.getRWById(rw_id || user.rw_id || '');
    const rt = store.getRTById(rt_id || user.rt_id || '');

    const ann = store.createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      target_audience: target_audience || 'ALL',
      rw_id: rw_id || user.rw_id,
      rt_id: rt_id || user.rt_id,
      rw_number: rw ? rw.number : undefined,
      rt_number: rt ? rt.number : undefined,
      author_id: user.id,
      author_name: user.name,
      author_role: user.role,
      publish_date: new Date().toISOString(),
      expired_date,
      is_published: true,
    });

    // Notify all targeted citizens in the store
    const allUsers = store.getUsers();
    for (const u of allUsers) {
      if (u.id === user.id) continue;
      let isTargeted = false;
      if (ann.target_audience === 'ALL') isTargeted = true;
      else if (ann.target_audience === 'RW' && u.rw_id === ann.rw_id) isTargeted = true;
      else if (ann.target_audience === 'RT' && u.rt_id === ann.rt_id) isTargeted = true;
      else if (ann.target_audience === 'KARANG_TARUNA' && (u.role === 'KARANG_TARUNA' || u.role === 'WARGA')) isTargeted = true;

      if (isTargeted) {
        NotificationGateway.sendInternal({
          userId: u.id,
          title: `Pengumuman Baru: ${ann.title}`,
          message: ann.content.substring(0, 100) + '...',
          type: 'ANNOUNCEMENT',
          referenceId: ann.id,
          referenceUrl: `/announcements/${ann.id}`,
        }).catch(() => {});
      }
    }

    AuditService.log({
      user,
      action: 'CREATE_ANNOUNCEMENT',
      module: 'ANNOUNCEMENT',
      recordId: ann.id,
      newValue: ann.title,
    });

    return NextResponse.json({ success: true, announcement: ann });
  } catch (err) {
    console.error('Create announcement error:', err);
    return NextResponse.json({ error: 'Gagal membuat pengumuman.' }, { status: 500 });
  }
}
