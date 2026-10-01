import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/session-token';

const ADMIN_COOKIE_NAME = 'codm_admin_session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all /admin routes
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';
    const adminSessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    let hasValidSession = false;
    if (adminSessionCookie) {
      const verified = await verifySession<{ role?: string }>(adminSessionCookie);
      if (verified && verified.role === 'ADMIN') {
        hasValidSession = true;
      }
    }

    // 1. If accessing protected admin route without cryptographically valid session, redirect to /admin/login
    if (!hasValidSession && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 2. If already authenticated and visiting /admin/login, redirect to /admin/dashboard
    if (hasValidSession && isLoginPage) {
      const dashboardUrl = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Backward compatibility for standard middleware runners
export const middleware = proxy;

export const config = {
  matcher: ['/admin/:path*'],
};
