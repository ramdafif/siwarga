import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { hashPassword, createSessionToken, sanitizeUser, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function POST(req: NextRequest) {
  try {
    const config = store.getSystemConfig();
    if (!config.allow_citizen_registration) {
      return NextResponse.json(
        { error: 'Pendaftaran warga mandiri sedang ditutup oleh pengurus wilayah.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, nik, email, phone, password, address, rw_id, rt_id } = body;

    // Validation
    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: 'Nama lengkap minimal 3 karakter.' }, { status: 422 });
    }
    if (!nik || !/^\d{16}$/.test(nik)) {
      return NextResponse.json({ error: 'NIK wajib terdiri dari 16 digit angka.' }, { status: 422 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 422 });
    }
    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: 'Nomor WhatsApp/HP minimal 10 digit.' }, { status: 422 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal 6 karakter.' }, { status: 422 });
    }
    if (!rw_id || !rt_id) {
      return NextResponse.json({ error: 'Pilihan RW dan RT wajib ditentukan.' }, { status: 422 });
    }

    // Unique checks
    if (store.getUserByEmail(email)) {
      return NextResponse.json({ error: 'Email sudah terdaftar dalam sistem.' }, { status: 409 });
    }
    if (store.getUserByNik(nik)) {
      return NextResponse.json({ error: 'NIK sudah terdaftar dalam sistem SIWARGA.' }, { status: 409 });
    }

    const password_hash = hashPassword(password);
    const newUser = store.createUser({
      name: name.trim(),
      nik,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address || '',
      rw_id,
      rt_id,
      role: 'WARGA',
      status: 'ACTIVE',
      password_hash,
    });

    const safeUser = sanitizeUser(newUser, 'WARGA');
    const token = createSessionToken(newUser.id);

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    AuditService.log({
      user: safeUser,
      action: 'CITIZEN_REGISTRATION',
      module: 'AUTH',
      recordId: newUser.id,
      newValue: `Pendaftaran warga baru: ${newUser.name} (RT/RW: ${rt_id}/${rw_id})`,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Pendaftaran berhasil! Selamat datang di SIWARGA.',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Gagal memproses pendaftaran warga.' }, { status: 500 });
  }
}
