// lib/supabase-browser.ts
// Safe browser Supabase client (public anon key only). Do NOT import this from server code.

import { createClient } from '@supabase/supabase-js'

/**
 * Public values required on the client.
 * Make sure these are defined in Vercel:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const publicAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!publicUrl || !publicAnon) {
  // Log once in the browser console to help diagnose missing envs during local dev
  console.warn(
    '[supabase-browser] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

/**
 * Returns a browser-safe Supabase client using the public anon key.
 * Uses persisted sessions & auto token refresh (recommended for auth flows).
 */
export function getSupabaseBrowser() {
  if (!publicUrl || !publicAnon) {
    throw new Error('Public Supabase env not configured')
  }

  return createClient(publicUrl, publicAnon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // handles OAuth/email magic-link redirects
    },
    global: {
      headers: { 'X-Client-Info': 'riplink-browser' },
    },
  })
}

// Alias so both imports are supported:
// import { getSupabaseBrowser } from '@/lib/supabase-browser'
// import { getBrowserSupabase } from '@/lib/supabase-browser'
export const getBrowserSupabase = getSupabaseBrowser
