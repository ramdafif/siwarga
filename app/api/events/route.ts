import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const rw_id = searchParams.get('rw_id') || user?.rw_id;

    const events = store.getEvents(rw_id);
    return NextResponse.json({ events });
  } catch (err) {
    console.error('Get events error:', err);
    return NextResponse.json({ error: 'Gagal memuat kegiatan masyarakat.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu.' }, { status: 401 });
    }

    if (user.role === 'WARGA') {
      return NextResponse.json({ error: 'Hanya pengurus atau Karang Taruna yang dapat membuat kegiatan.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, organizer, event_date, event_time, location, quota, rw_id } = body;

    if (!name || name.trim().length < 5) {
      return NextResponse.json({ error: 'Nama kegiatan minimal 5 karakter.' }, { status: 422 });
    }
    if (!event_date) {
      return NextResponse.json({ error: 'Tanggal kegiatan wajib diisi.' }, { status: 422 });
    }
    if (!location) {
      return NextResponse.json({ error: 'Lokasi kegiatan wajib diisi.' }, { status: 422 });
    }

    const event = store.createEvent({
      name: name.trim(),
      description: description ? description.trim() : '',
      organizer: organizer || user.name,
      event_date,
      event_time: event_time || '08:00 WIB',
      location: location.trim(),
      quota: parseInt(quota, 10) || 50,
      status: 'UPCOMING',
      rw_id: rw_id || user.rw_id,
      created_by_id: user.id,
      created_by_name: user.name,
    });

    AuditService.log({
      user,
      action: 'CREATE_EVENT',
      module: 'EVENT',
      recordId: event.id,
      newValue: event.name,
    });

    return NextResponse.json({ success: true, event });
  } catch (err) {
    console.error('Create event error:', err);
    return NextResponse.json({ error: 'Gagal membuat kegiatan.' }, { status: 500 });
  }
}
