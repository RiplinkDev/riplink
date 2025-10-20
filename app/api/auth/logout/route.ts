export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Clears our middleware cookie and (best-effort) clears Supabase cookies.
 * Client should ALSO call `supabase.auth.signOut()` for a full logout.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Clear our gate cookie
  const clears = [
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,
    // Best-effort clear common Supabase cookie names (domain/path must match to be effective)
    `sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,
    `sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,
    `sb:token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,
  ];

  res.headers.set('Set-Cookie', clears.join(', '));
  return res;
}
