import crypto from 'crypto';

/**
 * Generate a secure random token for email verification
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a secure random token for password reset
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate expiration date for verification tokens
 */
export function getVerificationExpiry(hours: number = 24): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

/**
 * Calculate expiration date for password reset tokens
 */
export function getPasswordResetExpiry(hours: number = 1): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

/**
 * Generate a verification URL for sending in emails
 */
export function generateVerificationUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/auth/verify-email?token=${token}`;
}

/**
 * Generate a password reset URL for sending in emails
 */
export function generatePasswordResetUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/auth/reset-password?token=${token}`;
}