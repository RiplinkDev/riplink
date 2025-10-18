export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, COOKIE_TTL_SEC } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const password = body?.password ?? '';

    const expected = process.env.DASHBOARD_PASS;
    if (!expected) {
      return NextResponse.json(
        { error: 'Server not configured (DASHBOARD_PASS missing)' },
        { status: 500 }
      );
    }

    if (password !== expected) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    const maxAge = COOKIE_TTL_SEC > 0 ? COOKIE_TTL_SEC : undefined;
    const parts = [
      `${COOKIE_NAME}=1`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Secure',
      maxAge ? `Max-Age=${maxAge}` : undefined, // omit for session cookie
    ].filter(Boolean);

    res.headers.set('Set-Cookie', parts.join('; '));
    return res;
  } catch {
    return NextResponse.json({ error: 'Login error' }, { status: 500 });
  }
}
