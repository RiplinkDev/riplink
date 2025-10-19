// lib/supabase-browser.ts
// Safe browser Supabase client (uses public anon key).

import { createClient } from '@supabase/supabase-js';

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publicAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!publicUrl || !publicAnon) {
  console.warn('[supabase-browser] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export function getSupabaseBrowser() {
  if (!publicUrl || !publicAnon) {
    throw new Error('Public Supabase env not configured');
  }
  return createClient(publicUrl, publicAnon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: { 'X-Client-Info': 'riplink-browser' },
    },
  });
}
