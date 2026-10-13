import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { store } from '../db/store';
import { User, SafeUser, UserRole } from '../types';

const SESSION_COOKIE_NAME = 'siwarga_session_token';
const AUTH_SECRET = process.env.AUTH_SECRET || 'siwarga-super-secure-production-secret-key-32chars';

export function hashPassword(password: string): string {
  // PBKDF2 with SHA-256 for secure password hashing
  const salt = crypto.createHash('sha256').update(AUTH_SECRET).digest('hex').substring(0, 16);
  return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  // Allow plain check for initial seed passwords if needed, else pbkdf2
  if (storedHash === password) return true;
  const hash = hashPassword(password);
  return hash === storedHash;
}

export function maskNik(nik: string): string {
  if (!nik || nik.length < 8) return '****************';
  return nik.substring(0, 6) + '******' + nik.substring(nik.length - 4);
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return '08**********';
  return phone.substring(0, 4) + '****' + phone.substring(phone.length - 2);
}

export function sanitizeUser(user: User, viewerRole?: UserRole): SafeUser {
  const isPrivileged = viewerRole === 'SUPER_ADMIN' || (viewerRole === 'ADMIN_RW' && user.role !== 'SUPER_ADMIN');
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: isPrivileged ? user.phone : maskPhone(user.phone),
    nik: isPrivileged ? user.nik : maskNik(user.nik),
    avatar: user.avatar,
    address: user.address,
    rw_id: user.rw_id,
    rt_id: user.rt_id,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
    masked_nik: maskNik(user.nik),
    masked_phone: maskPhone(user.phone),
  };
}

export function createSessionToken(userId: string): string {
  const payload = {
    uid: userId,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const str = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(str).digest('hex');
  return Buffer.from(`${str}.${signature}`).toString('base64url');
}

export function verifySessionToken(token: string): string | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const [payloadStr, signature] = raw.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) return null;

    return payload.uid;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const userId = verifySessionToken(token);
  if (!userId) return null;

  const user = store.getUserById(userId);
  if (!user || user.status !== 'ACTIVE') return null;

  return sanitizeUser(user, user.role);
}

export function getCurrentUserFromRequest(req: NextRequest | Request): SafeUser | null {
  let token: string | undefined;

  if ('cookies' in req && typeof req.cookies.get === 'function') {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    token = match ? match[1] : undefined;
  }

  if (!token) return null;

  const userId = verifySessionToken(token);
  if (!userId) return null;

  const user = store.getUserById(userId);
  if (!user || user.status !== 'ACTIVE') return null;

  return sanitizeUser(user, user.role);
}

export { SESSION_COOKIE_NAME };
