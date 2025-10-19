export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getXumm, strToHex } from '@/lib/xumm';
import { getSb } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Inputs: either (destination, amountXrp[, memo]) OR (linkId)
    const { destination, amountXrp, memo, linkId } = body;

    let dest = destination as string | undefined;
    let amount = amountXrp as number | undefined;
    let note = (memo as string | undefined) || undefined;

    // If linkId is present, look up link first
    if (linkId) {
      const sb = getSb();
      const { data: link, error } = await sb
        .from('payment_links')
        .select('*')
        .eq('id', linkId)
        .single();
      if (error || !link) return NextResponse.json({ error: 'Link not found' }, { status: 404 });
      dest = link.destination_address;
      amount = link.amount_drops / 1_000_000;
      note = link.memo || undefined;
    }

    if (!dest || !amount) {
      return NextResponse.json({ error: 'Missing destination or amount' }, { status: 400 });
    }

    const xumm = getXumm();
    const created = await xumm.payload.create({
      txjson: {
        TransactionType: 'Payment',
        Destination: dest,
        Amount: String(Math.round(amount * 1_000_000)),
        Memos: note ? [{ Memo: { MemoData: strToHex(note.slice(0, 128)) } }] : undefined,
      },
      options: { expire: 300 },
    });

    // Persist pay_request if linkId provided
    let requestId: string | undefined;
    if (linkId) {
      const sb = getSb();
      const { data, error } = await sb
        .from('pay_requests')
        .insert({
          payment_link_id: linkId,
          xumm_uuid: created.uuid,
          open_url: created.next?.always ?? null,
          qr_url: created.refs?.qr_png ?? null,
          status: 'awaiting',
        })
        .select()
        .single();
      if (!error) requestId = data.id;
    }

    return NextResponse.json({
      uuid: created.uuid,
      next: created.next.always,
      qr: created.refs.qr_png,
      requestId,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Xumm create failed' }, { status: 500 });
  }
}
