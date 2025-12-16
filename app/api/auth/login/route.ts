import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse, User } from '@/types';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { createAuthToken, setAuthCookie } from '@/lib/auth';
import { checkAuthRateLimit, calculateLockoutTime } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check rate limiting based on IP address
    const clientIP = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const rateLimitKey = `login:${clientIP}:${email.toLowerCase()}`;
    const rateLimit = checkAuthRateLimit(rateLimitKey, 5, 15); // 5 attempts per 15 minutes

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetAt! - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not
    if (!dbUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
      const lockoutTime = Math.ceil((dbUser.lockedUntil.getTime() - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { 
          error: `Account is locked. Please try again in ${lockoutTime} minutes.`,
          lockedUntil: dbUser.lockedUntil.toISOString()
        },
        { status: 423 }
      );
    }

    const passwordMatch = await bcryptjs.compare(password, dbUser.password);

    if (!passwordMatch) {
      // Increment failed login attempts
      const newFailedAttempts = dbUser.failedLoginAttempts + 1;
      const lockUntil = newFailedAttempts >= 5 ? new Date(Date.now() + calculateLockoutTime(newFailedAttempts) * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil: lockUntil,
        },
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!dbUser.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email before signing in.',
          emailVerified: false
        },
        { status: 401 }
      );
    }

    // Successful login - reset failed attempts and update last login
    const user: User = {
      id: dbUser.id,
      name: dbUser.name || '',
      email: dbUser.email,
      role: dbUser.role as 'admin' | 'user' | 'moderator',
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    };

    const token = createAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Reset failed attempts and update last login on successful login
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const responseBody: AuthResponse = {
      user: {
        ...user,
        emailVerified: dbUser.emailVerified,
      },
      token,
    };

    const response = NextResponse.json(responseBody, { status: 200 });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
