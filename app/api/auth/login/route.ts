export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, COOKIE_TTL_SEC } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Accepts EITHER:
 *  - { password } that matches process.env.DASHBOARD_PASS (legacy fallback)
 *  - OR presence of Supabase cookies (sb-access-token / sb:token) after a magic-link sign-in
 * In either case, issues our lightweight session cookie so middleware will allow access.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const pass = (body?.password ?? '') as string;

    const expected = process.env.DASHBOARD_PASS;

    // Detect Supabase session cookies (names Supabase uses in v2)
    const hasSupabaseSession =
      req.cookies.has('sb-access-token') ||
      req.cookies.has('sb:token') || // some environments use this key
      req.cookies.has('sb-refresh-token');

    if (!expected && !hasSupabaseSession) {
      return NextResponse.json(
        { error: 'Server not configured (DASHBOARD_PASS missing and no Supabase session found)' },
        { status: 500 }
      );
    }

    // If a password was provided, check it first
    if (pass) {
      if (pass !== expected) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    } else {
      // No password, require an existing Supabase session
      if (!hasSupabaseSession) {
        return NextResponse.json(
          { error: 'No Supabase session. Use magic link first.' },
          { status: 401 }
        );
      }
    }

    // Success -> issue our tiny gate cookie
    const res = NextResponse.json({ ok: true });

    const maxAge = Number.isFinite(COOKIE_TTL_SEC) && COOKIE_TTL_SEC! > 0 ? COOKIE_TTL_SEC : undefined;
    const parts = [
      `${COOKIE_NAME}=1`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Secure',
      maxAge ? `Max-Age=${maxAge}` : undefined, // omit for session cookie
    ].filter(Boolean) as string[];

    res.headers.set('Set-Cookie', parts.join('; '));
    return res;
  } catch {
    return NextResponse.json({ error: 'Login error' }, { status: 500 });
  }
}
