import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest, hashPassword } from '@/lib/auth/session';
import { filterUsersByRole } from '@/lib/auth/rbac';
import { AuditService } from '@/lib/services/auditService';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu.' }, { status: 401 });
    }

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_RW' && user.role !== 'ADMIN_RT') {
      return NextResponse.json({ error: 'Akses terbatas untuk pengurus wilayah.' }, { status: 403 });
    }

    const allUsers = store.getUsers();
    const visibleUsers = filterUsersByRole(allUsers, user);

    return NextResponse.json({ users: visibleUsers });
  } catch (err) {
    console.error('Get users error:', err);
    return NextResponse.json({ error: 'Gagal memuat data pengguna.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_RW')) {
      return NextResponse.json({ error: 'Hanya Super Admin atau Admin RW yang dapat mendaftarkan user baru dari sistem.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, nik, email, phone, role, rw_id, rt_id, address, password } = body;

    if (!name || !nik || !email || !role) {
      return NextResponse.json({ error: 'Nama, NIK, Email, dan Peran wajib diisi.' }, { status: 422 });
    }

    if (store.getUserByEmail(email)) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    }

    const password_hash = hashPassword(password || 'warga123');
    const newUser = store.createUser({
      name,
      nik,
      email: email.toLowerCase(),
      phone: phone || '',
      address: address || '',
      role,
      rw_id: rw_id || undefined,
      rt_id: rt_id || undefined,
      status: 'ACTIVE',
      password_hash,
    });

    AuditService.log({
      user,
      action: 'ADMIN_CREATE_USER',
      module: 'USER',
      recordId: newUser.id,
      newValue: `Pembuatan user baru: ${newUser.name} (${newUser.role})`,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err) {
    console.error('Create user error:', err);
    return NextResponse.json({ error: 'Gagal membuat user.' }, { status: 500 });
  }
}
