// /app/api/payments/[uuid]/status/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getXumm } from '@/lib/xumm';
import { getSb } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { uuid } = params;

    // Lazily construct Xumm; return 503 if not configured (don’t crash build)
    let xummClient;
    try {
      xummClient = getXumm();
    } catch {
      return NextResponse.json(
        { error: 'Xumm not configured on this environment' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const result = await xummClient.payload.get(uuid);
    const meta: any = (result as any)?.meta ?? {};

    const signed = !!meta.signed;
    const cancelled = !!meta.cancelled;
    const expired = !!meta.expired;

    // Prefer txid, fallback to hash if present
    const txid =
      signed
        ? ((result as any)?.response?.txid ??
           (result as any)?.response?.hash ??
           null)
        : null;

    // Best-effort: update matching pay_request in Supabase
    try {
      const sb = getSb();
      const { data: pr } = await sb
        .from('pay_requests')
        .select('id,status')
        .eq('xumm_uuid', uuid)
        .single();

      if (pr) {
        let newStatus = pr.status as string;
        if (signed) newStatus = 'signed';
        else if (expired) newStatus = 'expired';
        else if (cancelled) newStatus = 'cancelled';

        if (newStatus !== pr.status) {
          await sb
            .from('pay_requests')
            .update({
              status: newStatus,
              tx_hash: txid,
              resolved_at:
                signed || expired || cancelled
                  ? new Date().toISOString()
                  : null,
            })
            .eq('id', pr.id);
        }
      }
    } catch {
      // non-fatal on purpose
    }

    return NextResponse.json(
      { signed, cancelled, expired, txid },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
