import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse, User } from '@/types';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, dbUser.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Transform to User type for response
    const user: User = {
      id: dbUser.id,
      name: dbUser.name || '',
      email: dbUser.email,
      role: dbUser.role as 'admin' | 'user' | 'moderator',
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    };

    // Generate JWT token (base64 encoded for now)
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    const response: AuthResponse = {
      user,
      token,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
