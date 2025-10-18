// /app/login/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const next = useSearchParams().get("next") || "/dashboard";
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass }),
    });
    if (r.ok) router.replace(next);
    else {
      const j = await r.json().catch(() => ({}));
      setErr(j?.error || "Invalid password");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl p-6 glass-card">
        <h1 className="text-2xl font-bold mb-3 text-center">Riplink Login</h1>
        <p className="text-sm opacity-70 mb-6 text-center">
          Enter the test password to access the dashboard.
        </p>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg px-3 py-2 bg-black/20 border border-white/10 outline-none"
        />
        {err && <p className="text-red-400 text-sm mt-2">{err}</p>}
        <button
          disabled={loading}
          className="mt-4 w-full btn btn-primary disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
