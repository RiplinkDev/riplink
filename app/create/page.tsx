'use client';

import { useState } from 'react';

export default function CreatePage() {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [memo, setMemo] = useState('');
  const [res, setRes] = useState<{ payUrl?: string; error?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setRes(null);
    try {
      const r = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          amountXrp: Number(amount),
          memo,
        }),
      });
      const data = await r.json();
      setRes(data);
    } catch {
      setRes({ error: 'Create failed' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Create Payment Link</h1>
      <p className="opacity-70 mb-6">Enter an XRP destination, amount, and optional memo.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg bg-[#0d1f2f]/60 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/50"
          placeholder="r... (XRP address)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg bg-[#0d1f2f]/60 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/50"
          placeholder="Amount (XRP)"
          type="number"
          min="0"
          step="0.000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          required
        />
        <input
          className="w-full rounded-lg bg-[#0d1f2f]/60 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/50"
          placeholder="Memo (optional)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        <button
          className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 disabled:opacity-60"
          disabled={busy}
        >
          {busy ? 'Creating…' : 'Create Link'}
        </button>
      </form>

      {res?.payUrl && (
        <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-sm opacity-80 mb-1">Share this link:</div>
          <code className="text-cyan-300">{res.payUrl}</code>
        </div>
      )}
      {res?.error && <div className="mt-4 text-red-400">{res.error}</div>}
    </div>
  );
}
