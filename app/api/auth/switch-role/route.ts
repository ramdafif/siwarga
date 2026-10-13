import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { createSessionToken, sanitizeUser, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function POST(req: NextRequest) {
  try {
    const { targetEmail } = await req.json();

    const user = store.getUserByEmail(targetEmail);
    if (!user) {
      return NextResponse.json({ error: 'Akun demo tidak ditemukan.' }, { status: 404 });
    }

    const safeUser = sanitizeUser(user, user.role);
    const token = createSessionToken(user.id);

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    AuditService.log({
      user: safeUser,
      action: 'ROLE_SWITCH_DEMO',
      module: 'AUTH',
      recordId: user.id,
      newValue: `Beralih ke peran ${user.role} (${user.name})`,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: `Berhasil beralih ke peran ${user.name}`,
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
  } catch (error) {
    console.error('Switch role error:', error);
    return NextResponse.json({ error: 'Gagal beralih peran demo.' }, { status: 500 });
  }
}
