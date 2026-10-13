import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyPassword, createSessionToken, sanitizeUser, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const user = store.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid. Periksa kembali email dan kata sandi.' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Akun Anda sedang dinonaktifkan atau ditangguhkan oleh pengurus.' },
        { status: 403 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid. Periksa kembali email dan kata sandi.' },
        { status: 401 }
      );
    }

    const safeUser = sanitizeUser(user, user.role);
    const token = createSessionToken(user.id);

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    AuditService.log({
      user: safeUser,
      action: 'USER_LOGIN',
      module: 'AUTH',
      recordId: user.id,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Login berhasil.',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses login.' },
      { status: 500 }
    );
  }
}
