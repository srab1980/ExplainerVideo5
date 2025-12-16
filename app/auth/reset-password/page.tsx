'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { PasswordResetRequest } from '@/components/PasswordResetRequest';

export default function PasswordResetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <PasswordResetRequest onBackToLogin={handleBackToLogin} />
      </div>
    </div>
  );
}