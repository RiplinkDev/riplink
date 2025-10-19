'use client';

import { useEffect, useState } from 'react';

type Status = 'awaiting' | 'signed' | 'expired' | 'error';

type Props = {
  /** Initial payload info from the server (optional) */
  initial?: {
    requestId?: string;
    openUrl?: string;
    qrUrl?: string;
    status?: Status;
  };
  /** Base path for polling the request, default: /api/payments/ */
  pollUrlBase?: string;
};

/**
 * Minimal, defensive client for the pay page.
 * - If a requestId is provided, it polls /api/payments/:id/status
 * - On "signed" it redirects to /success/:txHash
 * - Renders QR + Open in Xumm when available.
 *
 * This component is intentionally tolerant of missing props so it won't break
 * if the server page changes shape.
 */
export default function PayClient({ initial, pollUrlBase = '/api/payments/' }: Props) {
  const [state, setState] = useState(initial ?? {});
  const status = (state as any)?.status as Status | undefined;
  const requestId = (state as any)?.requestId as string | undefined;

  useEffect(() => {
    if (!requestId || status !== 'awaiting') return;

    let alive = true;

    const poll = async () => {
      try {
        const res = await fetch(`${pollUrlBase}${requestId}/status`, { cache: 'no-store' });
        const json = await res.json();

        if (!alive) return;

        setState((s: any) => ({ ...s, ...json }));

        if (json?.status === 'signed' && json?.txHash) {
          window.location.href = `/success/${json.txHash}`;
          return;
        }
        if (alive && json?.status === 'awaiting') {
          setTimeout(poll, 3000);
        }
      } catch {
        if (alive) setTimeout(poll, 3000);
      }
    };

    const t = setTimeout(poll, 3000);
    return () => {
      alive = false;
      clearTimeout(t as any);
    };
  }, [requestId, status, pollUrlBase]);

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
