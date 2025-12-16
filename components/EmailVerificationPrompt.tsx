'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

interface EmailVerificationPromptProps {
  email: string;
  onResendVerification?: () => void;
  onVerificationComplete?: () => void;
}

export function EmailVerificationPrompt({ 
  email, 
  onResendVerification, 
  onVerificationComplete 
}: EmailVerificationPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resend: true }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
        onResendVerification?.();
      } else {
        setMessage(data.error || 'Failed to send verification email.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-amber-600 text-center">
          Verify Your Email
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
          We sent a verification link to your email address
        </p>
      </div>
      
      <div className="px-6 py-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 text-amber-600 px-4 py-3 rounded text-center">
          <strong>{email}</strong>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Click the verification link in your email to activate your account. 
          If you don't see the email, check your spam folder.
        </p>

        {message && (
          <div className={`px-4 py-3 rounded text-sm text-center ${
            message.includes('sent') 
              ? 'bg-green-50 border border-green-200 text-green-600'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Resend Verification Email'}
          </Button>
          
          <Button 
            onClick={onVerificationComplete}
            className="w-full"
            variant="outline"
          >
            I've Verified My Email
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>Verification link expires in 24 hours.</p>
          <p>For help, contact support.</p>
        </div>
      </div>
    </Card>
  );
}