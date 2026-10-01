import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/session-token';

const ADMIN_COOKIE_NAME = 'codm_admin_session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all /admin routes
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';
    const method = request.method.toUpperCase();
    const isStateModifying = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    // 1. CSRF & Cross-Origin validation
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (host && originUrl.host !== host) {
          return new NextResponse(
            JSON.stringify({ error: 'Unauthorized: Cross-Site Request Forgery (CSRF) origin mismatch.' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized: Invalid origin header.' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
    }

    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (host && refererUrl.host !== host) {
          return new NextResponse(
            JSON.stringify({ error: 'Unauthorized: CSRF referer mismatch.' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
          );
        }
      } catch {
        // Invalid referer format
      }
    }

    const adminSessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    let hasValidSession = false;
    if (adminSessionCookie) {
      const verified = await verifySession<{ role?: string }>(adminSessionCookie);
      if (verified && verified.role === 'ADMIN') {
        hasValidSession = true;
      }
    }

    // 2. Unauthenticated access handling
    if (!hasValidSession && !isLoginPage) {
      // Return 401 for curl / API / state-modifying requests or JSON requests
      const acceptHeader = request.headers.get('accept') || '';
      if (isStateModifying || !acceptHeader.includes('text/html')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized: Valid admin session required.' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }

      // Browser GET requests redirect to login page
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Authenticated admin visiting login page redirects to dashboard
    if (hasValidSession && isLoginPage && method === 'GET') {
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
