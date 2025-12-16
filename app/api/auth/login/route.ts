import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse, User } from '@/types';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAuthToken, setAuthCookie } from '@/lib/auth';

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

    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, dbUser.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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

    const responseBody: AuthResponse = {
      user,
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
