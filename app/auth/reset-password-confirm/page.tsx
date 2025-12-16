'use client';

import { PasswordResetConfirm } from '@/components/PasswordResetConfirm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <PasswordResetConfirm />
      </div>
    </div>
  );
}