// /app/api/xumm/payload/[uuid]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { xumm } from '@/lib/xumm';

type Params = { uuid: string };

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const uuid = params?.uuid;
  if (!uuid) {
    return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
  }

  try {
    // Ask Xumm for the current payload status
    const res = await xumm.payload.get(uuid);

    // Don’t cache polling responses
    const headers = { 'Cache-Control': 'no-store' as const };

    // Handle expiration first
    if (res?.meta?.expired) {
      return NextResponse.json({ signed: false, expired: true }, { headers });
    }

    // Handle signed
    if (res?.meta?.signed) {
      const txHash =
        (res as any)?.response?.txid ??
        (res as any)?.response?.hash ??
        null;

      return NextResponse.json(
        { signed: true, expired: false, txHash },
        { headers }
      );
    }

    // Still awaiting user signature
    return NextResponse.json({ signed: false, expired: false }, { headers });
  } catch (e: any) {
    console.error('xumm payload poll error:', e?.message ?? e);
    return NextResponse.json(
      { error: e?.message || 'poll error' },
      { status: 500 }
    );
  }
}
