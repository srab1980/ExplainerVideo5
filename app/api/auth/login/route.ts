import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse, User } from '@/types';

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

    // Mock authentication - In production, verify against a database
    // For demo purposes, accept any email with password "password123"
    if (password !== 'password123') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Mock user data
    const user: User = {
      id: Math.random().toString(36).slice(2, 11),
      name: email.split('@')[0],
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generate mock JWT token (in production, use a proper JWT library)
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
