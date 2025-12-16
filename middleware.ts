import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public paths
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/api/auth/custom-signin',
    '/api/auth/custom-signout',
    '/_next/static',
    '/_next/image',
    '/favicon.ico',
    '/public'
  ];

  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check authentication for protected paths
  const authToken = request.cookies.get('authToken')?.value;

  if (!authToken || !verifyAuthToken(authToken)) {
    // Redirect to sign in page for page requests
    if (!pathname.startsWith('/api/')) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // Return 401 for API requests
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (custom auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth/custom|_next/static|_next/image|favicon.ico|public).*)',
  ],
};