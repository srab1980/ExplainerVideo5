'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';

interface PasswordResetRequestProps {
  onBackToLogin?: () => void;
}

export function PasswordResetRequest({ onBackToLogin }: PasswordResetRequestProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setMessage(data.error || 'Failed to send reset email');
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
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
          Reset Password
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
          Enter your email to receive a password reset link
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="Enter your email address"
          required
        />

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
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          
          <Button 
            type="button"
            onClick={onBackToLogin}
            className="w-full"
            variant="outline"
          >
            Back to Login
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>Reset link expires in 1 hour.</p>
          <p>For help, contact support.</p>
        </div>
      </form>
    </Card>
  );
}