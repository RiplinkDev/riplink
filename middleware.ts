// /middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/create/:path*'],
};

export function middleware(req: NextRequest) {
  // pass if our legacy cookie is set
  const gate = req.cookies.get(COOKIE_NAME)?.value === '1';

  // or if Supabase has logged-in session cookies set
  const hasSupabase =
    req.cookies.has('sb-access-token') ||
    req.cookies.has('sb:token') ||
    req.cookies.has('sb-refresh-token');

  if (gate || hasSupabase) return NextResponse.next();

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
