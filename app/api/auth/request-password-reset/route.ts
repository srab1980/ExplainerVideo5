import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken, getPasswordResetExpiry, generatePasswordResetUrl } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

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
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken();
    const tokenExpiry = getPasswordResetExpiry(1); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: tokenExpiry,
      },
    });

    // TODO: Send password reset email
    const baseUrl = request.url.includes('localhost') 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://yourapp.com';
    
    const resetUrl = generatePasswordResetUrl(resetToken, baseUrl);
    
    console.log('🔑 Password Reset URL:', resetUrl);
    console.log('📧 Email would be sent to:', email);

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent successfully',
      // In development, return the reset URL for testing
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to request password reset' },
      { status: 500 }
    );
  }
}