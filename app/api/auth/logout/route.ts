import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function POST(req: NextRequest) {
  const currentUser = getCurrentUserFromRequest(req);
  if (currentUser) {
    AuditService.log({
      user: currentUser,
      action: 'USER_LOGOUT',
      module: 'AUTH',
      recordId: currentUser.id,
    });
  }

  const response = NextResponse.json({ success: true, message: 'Logout berhasil.' });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
