import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth Middleware for route protection
 *
 * NOTE: This only handles initial route protection.
 * Client-side auth (401 interceptor) handles redirects after API calls.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login';
  const isAuthApi = pathname.startsWith('/api/auth/');

  // Allow auth API endpoints
  if (isAuthApi) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow all routes - client-side auth will handle redirects
  // If no token in localStorage, axios 401 interceptor will redirect
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
