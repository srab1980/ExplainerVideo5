'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EmailVerificationPrompt } from '@/components/EmailVerificationPrompt';

export default function EmailVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    // If there's a token, verify the email automatically
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;

    setIsVerifying(true);
    setMessage('');

    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage(data.message);
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          router.push('/dashboard?verified=true');
        }, 2000);
      } else {
        setVerificationStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerificationComplete = () => {
    router.push('/dashboard');
  };

  // Show verification result if token was present
  if (token && (verificationStatus === 'success' || verificationStatus === 'error')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            {verificationStatus === 'success' ? (
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {message || 'Your email has been successfully verified.'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Redirecting to dashboard...
                </p>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-red-600 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {message || 'The verification link is invalid or has expired.'}
                </p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show verification prompt if no token or verification in progress
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <EmailVerificationPrompt
          email={userEmail || 'your@email.com'}
          onVerificationComplete={handleVerificationComplete}
          onResendVerification={() => {
            // Could implement logic to track resend attempts
            console.log('Resend verification requested');
          }}
        />
      </div>
    </div>
  );
}