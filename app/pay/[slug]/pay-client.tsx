'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'awaiting' | 'signed' | 'cancelled' | 'expired' | 'error';

type Props = {
  initial?: {
    requestId?: string;
    openUrl?: string;
    qrUrl?: string;
    status?: Status;
  };
  pollUrlBase?: string; // default: /api/payments/
};

export default function PayClient({ initial, pollUrlBase = '/api/payments/' }: Props) {
  const router = useRouter();
  const [state, setState] = useState(initial ?? {});
  const status = (state as any)?.status as Status | undefined;
  const requestId = (state as any)?.requestId as string | undefined;

  // gentle backoff
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // must have a request to poll
    if (!requestId) return;

    // only poll while we are actively waiting
    if (status && status !== 'awaiting') return;

    let delay = 1200; // start ~1.2s
    const maxDelay = 6000;

    const tick = async () => {
      try {
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const r = await fetch(`${pollUrlBase}${requestId}/status`, {
          cache: 'no-store',
          signal: abortRef.current.signal,
        });
        const d = await r.json();

        setState((s: any) => ({ ...s, ...d }));

        // redirect on success
        if (d.status === 'signed') {
          if (d.txHash) router.replace(`/success/${d.txHash}`);
          return; // stop polling
        }

        // stop polling on terminal states
        if (d.status === 'cancelled' || d.status === 'expired' || d.status === 'error') {
          return;
        }

        // backoff & poll again
        delay = Math.min(delay + 400, maxDelay);
        timerRef.current = window.setTimeout(tick, delay);
      } catch {
        // transient failure -> backoff and try again
        delay = Math.min(delay + 400, maxDelay);
        timerRef.current = window.setTimeout(tick, delay);
      }
    };

    // kick off
    timerRef.current = window.setTimeout(tick, delay);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [requestId, status, pollUrlBase, router]);

  if (!requestId) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {(state as any)?.qrUrl ? (
        <img
          src={(state as any).qrUrl}
          alt="Xumm QR"
          className="w-56 h-56 bg-white rounded-lg p-2"
        />
      ) : null}

      {(state as any)?.openUrl ? (
        <a
          href={(state as any).openUrl}
          target="_blank"
          rel="noreferrer"
          className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-sky-500 text-white"
        >
          Open in Xumm
        </a>
      ) : null}

      <div className="text-sm opacity-75">
        Status: {(state as any)?.status ?? 'awaiting'}
      </div>
    </div>
  );
}
