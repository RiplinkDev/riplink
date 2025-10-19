'use client'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function SignOutButton() {
  const sb = getSupabaseBrowser()
  return (
    <button
      onClick={async () => {
        await sb.auth.signOut()
        window.location.href = '/login'
      }}
      className="text-sm text-white/70 hover:text-white underline"
    >
      Sign out
    </button>
  )
}
