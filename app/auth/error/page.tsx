'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    
    switch (errorParam) {
      case 'Configuration':
        setError('There is a problem with the server configuration.');
        break;
      case 'AccessDenied':
        setError('Access denied. You do not have permission to sign in.');
        break;
      case 'Verification':
        setError('The verification link has expired or has already been used.');
        break;
      default:
        setError('An error occurred during authentication.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-red-600">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            Something went wrong with your sign-in process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Please try signing in again or contact support if the problem persists.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full"
              onClick={() => window.location.href = '/auth/signin'}
            >
              Try Sign In Again
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}