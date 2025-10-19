// lib/supabase-server.ts
// Server-side Supabase helpers for Next.js App Router.
// - getServerSupabase(): RLS-safe, user-scoped client (uses ANON key + cookies)
// - getSupabaseAdmin():  privileged client (uses SERVICE ROLE) — use sparingly.
//
// Keep Service Role strictly server-only (never import in client components).

export const runtime = 'nodejs';

import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/* -------------------------------------------------------------------------- */
/*  User-scoped server client (recommended for API routes & pages)            */
/* -------------------------------------------------------------------------- */

export function getServerSupabase(): SupabaseClient {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anon) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  const cookieStore = cookies();
  const hdrs = headers();

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      // In the Next.js App Router you typically set cookies on the Response
      // object in the route/page. These no-ops are fine for most flows.
      set() {},
      remove() {},
    },
    headers: () => ({
      // Forwarded headers help auth-helpers build correct redirect URLs
      'x-forwarded-host': hdrs.get('x-forwarded-host') ?? '',
      'x-forwarded-proto': hdrs.get('x-forwarded-proto') ?? '',
    }),
  });
}

/* -------------------------------------------------------------------------- */
/*  Admin client (Service Role) — use only for trusted server tasks           */
/* -------------------------------------------------------------------------- */

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !serviceRole) {
    throw new Error(
      '[supabase-admin] Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY'
    );
  }
  if (_admin) return _admin;

  _admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'riplink-server' } },
  });
  return _admin;
}

/* -------------------------------------------------------------------------- */
/*  Optional helper: require an authenticated session in server components    */
/* -------------------------------------------------------------------------- */

export async function requireServerSession() {
  const sb = getServerSupabase();
  const {
    data: { session },
    error,
  } = await sb.auth.getSession();

  if (error || !session?.user) {
    return { session: null, user: null };
  }
  return { session, user: session.user };
}
