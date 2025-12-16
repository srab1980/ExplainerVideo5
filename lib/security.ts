import crypto from 'crypto';

/**
 * Generate a unique request ID for rate limiting
 */
export function generateRequestId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Simple rate limiter implementation using in-memory storage
 * In production, use Redis or similar for distributed rate limiting
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class MemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();

  /**
   * Check if a request should be rate limited
   */
  check(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt?: number } {
    const now = Date.now();
    const record = this.store.get(key);

    // If no record or window has reset, create new record
    if (!record || now >= record.resetAt) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetAt: now + windowMs,
      };
      this.store.set(key, newRecord);
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: newRecord.resetAt,
      };
    }

    // Check if limit exceeded
    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      };
    }

    // Increment count
    record.count++;
    this.store.set(key, record);

    return {
      allowed: true,
      remaining: limit - record.count,
      resetAt: record.resetAt,
    };
  }

  /**
   * Clean up expired records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimiter = new MemoryRateLimiter();

/**
 * Rate limiting for authentication endpoints
 */
export function checkAuthRateLimit(key: string, maxAttempts: number = 5, windowMinutes: number = 15): { allowed: boolean; remaining: number; resetAt?: number } {
  return rateLimiter.check(key, maxAttempts, windowMinutes * 60 * 1000);
}

/**
 * Enhanced password strength validation
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain repeating characters (e.g., aaa, 111)');
  }

  if (/(?:012|123|234|345|456|567|678|789)/.test(password)) {
    errors.push('Password cannot contain sequential characters');
  }

  // Check for common passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwertyuiop',
    'admin', 'admin123', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'login', 'abc123', 'password1'
  ];

  if (commonPasswords.some(common => 
    password.toLowerCase().includes(common)
  )) {
    errors.push('Password cannot contain common words or patterns');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate secure random string for various purposes
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate backup codes for 2FA
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-digit codes with dashes for readability
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
    codes.push(formattedCode);
  }
  return codes;
}

/**
 * Validate email format more strictly
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Calculate wait time for account lockout
 */
export function calculateLockoutTime(attempts: number): number {
  // Exponential backoff: 5min, 15min, 30min, 1hour, 2hours
  const lockoutTimes = [5, 15, 30, 60, 120];
  const index = Math.min(attempts - 5, lockoutTimes.length - 1);
  return lockoutTimes[Math.max(index, 0)];
}