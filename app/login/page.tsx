'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = getSupabaseBrowser()
  const router = useRouter()

  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // If already signed in, bounce to dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard')
    })
    // Also handle return from magic-link
    const { data: sub } = supabase.auth.onAuthStateChange((evt) => {
      if (evt === 'SIGNED_IN') router.replace('/dashboard')
    })
    return () => sub.subscription.unsubscribe()
  }, []) // eslint-disable-line

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        })
        if (error) throw error
        setMsg('✅ Check your email for a magic link to sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace('/dashboard')
      }
    } catch (err: any) {
      setMsg(err?.message || 'Sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-14">
      <h1 className="text-3xl font-bold text-center mb-6">Sign in to Riplink</h1>

      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setMode('magic')}
          className={`px-3 py-1 rounded ${
            mode === 'magic' ? 'bg-white/10' : 'border border-white/10'
          }`}
        >
          Magic Link
        </button>
        <button
          onClick={() => setMode('password')}
          className={`px-3 py-1 rounded ${
            mode === 'password' ? 'bg-white/10' : 'border border-white/10'
          }`}
        >
          Password
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded bg-white/10 px-3 py-2"
        />
        {mode === 'password' && (
          <input
            type="password"
            required
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded bg-white/10 px-3 py-2"
          />
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-2 rounded disabled:opacity-60"
        >
          {loading ? 'Working…' : 'Sign In'}
        </button>
      </form>

      {msg && <p className="mt-4 text-center text-sm opacity-80">{msg}</p>}

      <p className="mt-6 text-center text-xs opacity-60">
        By continuing, you agree to the Riplink Terms & Privacy.
      </p>
    </div>
  )
}
