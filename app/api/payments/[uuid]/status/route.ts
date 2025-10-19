export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getXumm } from '@/lib/xumm';
import { getSb } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const xumm = getXumm();
    const { uuid } = params;

    const result = await xumm.payload.get(uuid);
    const meta = result?.meta;

    const signed = !!meta?.signed;
    const cancelled = !!meta?.cancelled;
    const expired = !!meta?.expired;
    const txid = signed ? result?.response?.txid ?? null : null;

    // Try to update any matching pay_request
    try {
      const sb = getSb();
      const { data: pr } = await sb
        .from('pay_requests')
        .select('id,status')
        .eq('xumm_uuid', uuid)
        .single();
      if (pr) {
        let newStatus = pr.status;
        if (signed) newStatus = 'signed';
        else if (expired) newStatus = 'expired';
        else if (cancelled) newStatus = 'cancelled';

        if (newStatus !== pr.status) {
          await sb
            .from('pay_requests')
            .update({
              status: newStatus,
              tx_hash: txid,
              resolved_at: signed || expired || cancelled ? new Date().toISOString() : null,
            })
            .eq('id', pr.id);
        }
      }
    } catch {
      // non-fatal
    }

    return NextResponse.json({ signed, cancelled, expired, txid });
  } catch (err) {
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}
