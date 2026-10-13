import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { filterComplaintsByRole } from '@/lib/auth/rbac';
import { ComplaintService } from '@/lib/services/complaintService';
import { ComplaintPriority, ComplaintStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status') as ComplaintStatus | undefined;
    const category_id = searchParams.get('category_id') || undefined;
    const priority = searchParams.get('priority') as ComplaintPriority | undefined;
    const rw_id = searchParams.get('rw_id') || undefined;
    const rt_id = searchParams.get('rt_id') || undefined;
    const keyword = searchParams.get('keyword') || undefined;
    const reporterOnly = searchParams.get('my') === 'true';

    // Get filtered from store
    const rawList = store.getComplaints({
      status,
      category_id,
      priority,
      rw_id,
      rt_id,
      keyword,
    });

    if (!user) {
      // Public view: only show complaints marked is_public
      const publicList = rawList.filter((c) => c.is_public);
      return NextResponse.json({ complaints: publicList });
    }

    let scoped = filterComplaintsByRole(rawList, user);
    if (reporterOnly) {
      scoped = scoped.filter((c) => c.reporter_id === user.id);
    }

    return NextResponse.json({ complaints: scoped });
  } catch (err) {
    console.error('List complaints error:', err);
    return NextResponse.json({ error: 'Gagal memuat daftar pengaduan.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap masuk (login) terlebih dahulu.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category_id, priority, rw_id, rt_id, address_location, latitude, longitude, is_public, attachments } = body;

    // Validation
    if (!title || title.trim().length < 5) {
      return NextResponse.json({ error: 'Judul pengaduan minimal 5 karakter.' }, { status: 422 });
    }
    if (!description || description.trim().length < 15) {
      return NextResponse.json({ error: 'Deskripsi pengaduan minimal 15 karakter agar detail laporan jelas.' }, { status: 422 });
    }
    if (!category_id) {
      return NextResponse.json({ error: 'Kategori pengaduan wajib dipilih.' }, { status: 422 });
    }
    if (!address_location || address_location.trim().length < 5) {
      return NextResponse.json({ error: 'Alamat atau patokan lokasi wajib diisi lengkap.' }, { status: 422 });
    }

    const targetRwId = rw_id || user.rw_id;
    const targetRtId = rt_id || user.rt_id;

    if (!targetRwId || !targetRtId) {
      return NextResponse.json({ error: 'Wilayah RW dan RT wajib dipilih.' }, { status: 422 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const complaint = await ComplaintService.create(
      {
        title: title.trim(),
        description: description.trim(),
        category_id,
        priority: priority || 'MEDIUM',
        rw_id: targetRwId,
        rt_id: targetRtId,
        address_location: address_location.trim(),
        latitude,
        longitude,
        is_public: is_public ?? true,
        attachments: attachments || [],
      },
      user,
      { ipAddress: ip, userAgent }
    );

    return NextResponse.json({ success: true, complaint });
  } catch (err) {
    console.error('Create complaint error:', err);
    return NextResponse.json({ error: 'Gagal membuat pengaduan.' }, { status: 500 });
  }
}
