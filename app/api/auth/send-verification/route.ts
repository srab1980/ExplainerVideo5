import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken, getVerificationExpiry, generateVerificationUrl } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, resend = false } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a verification email has been sent.',
      });
    }

    // Check if user is already verified
    if (user.emailVerified && !resend) {
      return NextResponse.json(
        { success: false, error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = getVerificationExpiry(24); // 24 hours

    // Update user with verification token
    await prisma.user.update({
      where: { email },
      data: {
        emailVerifyToken: verificationToken,
        emailVerifyExpires: tokenExpiry,
      },
    });

    // TODO: Send verification email
    // For now, we'll just log the verification URL
    const baseUrl = request.url.includes('localhost') 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://yourapp.com';
    
    const verificationUrl = generateVerificationUrl(verificationToken, baseUrl);
    
    console.log('🔗 Verification URL:', verificationUrl);
    console.log('📧 Email would be sent to:', email);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      // In development, return the verification URL for testing
      ...(process.env.NODE_ENV === 'development' && { verificationUrl }),
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}