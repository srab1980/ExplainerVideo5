import crypto from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';
import type { User } from '@/types';

export type AuthRole = User['role'];

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: AuthRole;
  exp: number;
};

const COOKIE_NAME = 'authToken';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'dev-jwt-secret-change-me';
}

function base64UrlEncode(input: Buffer | string): string {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input: string): Buffer {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  return Buffer.from(base64 + '='.repeat(padLength), 'base64');
}

function sign(data: string, secret: string): string {
  return base64UrlEncode(crypto.createHmac('sha256', secret).update(data).digest());
}

export function createAuthToken(
  payload: Omit<AuthTokenPayload, 'exp'>,
  options?: { ttlSeconds?: number; nowMs?: number }
): string {
  const ttlSeconds = options?.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const nowMs = options?.nowMs ?? Date.now();

  const tokenPayload: AuthTokenPayload = {
    ...payload,
    exp: Math.floor(nowMs / 1000) + ttlSeconds,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = sign(encodedPayload, getJwtSecret());

  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = sign(encodedPayload, getJwtSecret());
  if (signature.length !== expected.length) {
    return null;
  }

  const signatureOk = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!signatureOk) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as AuthTokenPayload;

    if (!payload?.userId || !payload?.email || !payload?.role || !payload?.exp) {
      return null;
    }

    if (payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice('bearer '.length).trim();
  }

  return null;
}

export function getAuthSession(request: NextRequest): AuthTokenPayload | null {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DEFAULT_TTL_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function isPrivilegedRole(role: AuthRole): boolean {
  return role === 'admin' || role === 'moderator';
}
