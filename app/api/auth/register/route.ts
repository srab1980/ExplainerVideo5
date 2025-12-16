import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse, User } from '@/types';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { createAuthToken, setAuthCookie } from '@/lib/auth';
import { generateVerificationToken, getVerificationExpiry, generateVerificationUrl } from '@/lib/tokens';
import { validatePasswordStrength, validateEmail } from '@/lib/security';

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

    // Enhanced password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Enhanced email validation
    if (!validateEmail(email)) {
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

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = getVerificationExpiry(24); // 24 hours

    const dbUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user',
        emailVerifyToken: verificationToken,
        emailVerifyExpires: tokenExpiry,
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

    // TODO: Send verification email
    const baseUrl = request.url.includes('localhost') 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://yourapp.com';
    
    const verificationUrl = generateVerificationUrl(verificationToken, baseUrl);
    
    console.log('🔗 Verification URL:', verificationUrl);
    console.log('📧 Email would be sent to:', email);

    const responseBody: AuthResponse = {
      user: {
        ...user,
        emailVerified: dbUser.emailVerified, // Include verification status
      },
      token,
      verificationRequired: !dbUser.emailVerified,
      // In development, include the verification URL for testing
      ...(process.env.NODE_ENV === 'development' && { verificationUrl }),
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
