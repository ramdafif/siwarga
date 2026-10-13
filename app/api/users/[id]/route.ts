import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest, hashPassword, sanitizeUser } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = getCurrentUserFromRequest(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu.' }, { status: 401 });
    }

    const targetUser = store.getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    // Permission check
    const isSelf = currentUser.id === id;
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    const isRWAdmin = currentUser.role === 'ADMIN_RW' && targetUser.rw_id === currentUser.rw_id && targetUser.role !== 'SUPER_ADMIN';

    if (!isSelf && !isSuperAdmin && !isRWAdmin) {
      return NextResponse.json({ error: 'Anda tidak memiliki hak mengubah data user ini.' }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.name) updates.name = body.name;
    if (body.phone) updates.phone = body.phone;
    if (body.address) updates.address = body.address;

    // Privileged only updates
    if (isSuperAdmin || isRWAdmin) {
      if (body.status) updates.status = body.status;
      if (body.role && isSuperAdmin) updates.role = body.role;
      if (body.rw_id) updates.rw_id = body.rw_id;
      if (body.rt_id) updates.rt_id = body.rt_id;
    }

    // Password reset
    if (body.password) {
      updates.password_hash = hashPassword(body.password);
    }

    const updated = store.updateUser(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Gagal memperbarui user.' }, { status: 500 });
    }

    AuditService.log({
      user: currentUser,
      action: isSelf ? 'USER_UPDATE_PROFILE' : 'ADMIN_UPDATE_USER',
      module: 'USER',
      recordId: id,
      newValue: JSON.stringify(updates),
    });

    return NextResponse.json({ success: true, user: sanitizeUser(updated, currentUser.role) });
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui user.' }, { status: 500 });
  }
}
