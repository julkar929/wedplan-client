import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * Edge-level route protection (cheap cookie presence check, no DB call).
 * Private pages -> redirect to /signin?redirect=<original path>.
 * Role checks happen in the dashboard layouts (UX) and — authoritatively — in the API (JWT + RBAC).
 */
export function proxy(request: NextRequest) {
  const hasSession = !!getSessionCookie(request, { cookiePrefix: 'wedplan' });
  if (!hasSession) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/services/:id', '/payment/:path*'],
};
