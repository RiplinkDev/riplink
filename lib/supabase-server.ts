// lib/supabase-server.ts
// Server-only Supabase client (uses SERVICE ROLE). Never import from client components.

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!; // <-- name matches Vercel UI

if (!url || !serviceRole) {
  // Don't throw at module load so build doesn't crash; throw when used.
  console.warn('[supabase-server] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export function getSupabaseAdmin() {
  if (!url || !serviceRole) {
    throw new Error('Server Supabase env not configured');
  }
  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { 'X-Client-Info': 'riplink-server' },
    },
  });
}
