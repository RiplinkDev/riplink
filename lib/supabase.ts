// lib/supabase.ts  (server-only)
export const runtime = 'nodejs'
import { createClient } from '@supabase/supabase-js'
const url = process.env.SUPABASE_URL!
const serviceRole = process.env.SUPABASE_SERVICE_ROLE!
export function getSb() {
  if (!url || !serviceRole) throw new Error('Supabase env not configured')
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'riplink-server' } },
  })
}
