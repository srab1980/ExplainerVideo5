import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse, User } from '@/types';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAuthToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const dbUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user',
      },
    });

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

    const response = NextResponse.json(responseBody, { status: 201 });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
