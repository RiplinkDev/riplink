'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(url, anon);

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold mb-3">Sign in</h1>
      {sent ? (
        <p className="text-sm opacity-80">Check your email for a magic link.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
          />
          <button
            className="w-full rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-4 py-2"
          >
            Send magic link
          </button>
          {err && <p className="text-red-400 text-sm">{err}</p>}
        </form>
      )}
    </div>
  );
}
