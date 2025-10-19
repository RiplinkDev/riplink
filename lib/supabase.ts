// lib/supabase.ts — server-only Supabase client (self-contained)
export const runtime = "nodejs";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const secret =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_ANON_KEY ||
  "";

if (!url || !secret) {
  // Don’t throw during build so you can still deploy & use /api/env-check
  console.warn(
    "[supabase] Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL or SUPABASE_*_KEY"
  );
}

export function getSb(): SupabaseClient {
  if (!url || !secret) {
    throw new Error("Supabase env not configured");
  }
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "riplink-server" } },
  });
}
