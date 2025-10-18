"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginClient() {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const sp = useSearchParams();
  const router = useRouter();
  const next = sp.get("next") || "/dashboard";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: pwd }),
    });

    if (r.ok) {
      router.replace(next);
      router.refresh();
    } else {
      const j = await r.json().catch(() => ({}));
      setErr(j?.error || "Invalid password");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">Riplink Login</h1>
        <p className="text-sm text-white/60 mb-4 text-center">
          Enter the test password to access the dashboard.
        </p>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 outline-none mb-3"
        />
        {err && <p className="text-red-400 text-sm mb-2">{err}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-sky-500 py-2 font-semibold"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
