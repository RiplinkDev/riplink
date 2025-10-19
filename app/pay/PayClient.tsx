'use client';

import { useEffect, useState } from 'react';

export default function PayClient(props: {
  linkId: string;
  title: string;
  to: string;
  amountXrp: number;
  memo?: string;
}) {
  const { linkId, title, to, amountXrp, memo } = props;

  const [qr, setQr] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [status, setStatus] = useState<'awaiting' | 'signed' | 'cancelled'>('awaiting');

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId }), // uses DB values server-side
      });
      const d = await r.json();
      setQr(d.qr);
      setNext(d.next);
      setUuid(d.uuid);
    })();
  }, [linkId]);

  useEffect(() => {
    if (!uuid) return;
    const i = setInterval(async () => {
      const r = await fetch(`/api/payments/${uuid}/status`);
      const d = await r.json();
      if (d.signed) {
        setStatus('signed');
        clearInterval(i);
        if (d.txid) window.location.href = `/success/${d.txid}`;
      } else if (d.cancelled || d.expired) {
        setStatus('cancelled');
        clearInterval(i);
      }
    }, 3000);
    return () => clearInterval(i);
  }, [uuid]);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      <div className="opacity-70 text-sm mb-2">Pay {amountXrp} XRP</div>
      {memo && <div className="opacity-70 text-sm mb-4">Memo: {memo}</div>}
      <div className="opacity-60 text-xs break-all mb-6">To: {to}</div>

      {!qr ? (
        <div className="opacity-70">Preparing request…</div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Xumm QR" className="mx-auto w-56 h-56 rounded-lg bg-white" />
          <a
            href={next ?? '#'}
            className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-cyan-500 text-white font-semibold"
          >
            Open in Xumm
          </a>

          <div className="mt-4 text-sm opacity-80">
            {status === 'awaiting' && 'Awaiting signature…'}
            {status === 'signed' && 'Signed & submitted ✅'}
            {status === 'cancelled' && 'Expired / Cancelled ❌'}
          </div>
        </>
      )}
    </div>
  );
}
