'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const router = useRouter();
  const sp = useSearchParams();

  // If you came from a protected page, we’ll send you back there after login
  const next = sp.get('next') || '/dashboard';

  const [mode, setMode] = useState<'magic' | 'password'>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // If we already have a session (e.g. opened from a magic link), redirect
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data.user) {
        router.replace(next);
      }
    })();

    // Also respond to auth changes (when the magic link completes)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) router.replace(next);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [next, router, supabase]);

  async function sendMagicLink() {
    setErr(null); setMsg(null); setSending(true);
    try {
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || 'https://riplink.vercel.app';

      // Important: redirect back to login (same domain) so cookies are set correctly
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/login?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setMsg('Check your email for a magic link to sign in.');
    } catch (e: any) {
      setErr(e?.message || 'Could not send magic link.');
    } finally {
      setSending(false);
    }
  }

  async function signInWithPassword() {
    setErr(null); setMsg(null); setSending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace(next);
    } catch (e: any) {
      setErr(e?.message || 'Sign in failed.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="mb-4 text-center text-3xl font-extrabold">Sign in to Riplink</h1>

        <div className="mb-4 flex gap-2">
          <button
            className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === 'magic' ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'}`}
            onClick={() => setMode('magic')}
            type="button"
          >
            Magic Link
          </button>
          <button
            className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === 'password' ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'}`}
            onClick={() => setMode('password')}
            type="button"
          >
            Password
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="you@email.com"
            className="w-full rounded-md bg-black/20 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-white/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          {mode === 'password' && (
            <input
              type="password"
              placeholder="Your password"
              className="w-full rounded-md bg-black/20 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-white/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          )}

          <button
            onClick={mode === 'magic' ? sendMagicLink : signInWithPassword}
            disabled={sending || !email || (mode === 'password' && !password)}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {mode === 'magic' ? 'Send Magic Link' : (sending ? 'Signing in…' : 'Sign In')}
          </button>

          {msg && <p className="text-xs text-emerald-300">{msg}</p>}
          {err && <p className="text-xs text-rose-300">{err}</p>}

          <p className="mt-2 text-center text-xs opacity-70">
            By continuing, you agree to the Riplink Terms &amp; Privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
