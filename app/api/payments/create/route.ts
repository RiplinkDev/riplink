// /app/api/payments/create/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { xumm, strToHex } from '@/lib/xumm';
import { getSb } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Inputs: either (destination, amountXrp[, memo]) OR (linkId)
    const { destination, amountXrp, memo, linkId } = body as {
      destination?: string;
      amountXrp?: number;
      memo?: string;
      linkId?: string;
    };

    let dest = destination;
    let amount = amountXrp;
    let note = memo ?? undefined;

    // If linkId is present, look up link first
    if (linkId) {
      const sb = getSb();
      const { data: link, error } = await sb
        .from('payment_links')
        .select('id, destination_address, amount_drops, memo')
        .eq('id', linkId)
        .single();

      if (error || !link) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 });
      }

      dest = link.destination_address;
      amount = Number(link.amount_drops) / 1_000_000;
      note = link.memo ?? undefined;
    }

    if (!dest || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Missing destination or amount' },
        { status: 400 }
      );
    }

    // Build Xumm payload (Amount in drops as string)
    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'Payment',
        Destination: dest,
        Amount: String(Math.round(amount * 1_000_000)),
        Memos: note
          ? [{ Memo: { MemoData: strToHex(note.slice(0, 128)) } }]
          : undefined,
      },
      options: { expire: 300, submit: false },
      custom_meta: { instruction: 'Approve this XRP payment' },
    });

    const uuid = (payload as any)?.uuid as string | undefined;
    const openUrl =
      (payload as any)?.next?.always ??
      (uuid ? `https://xumm.app/sign/${uuid}` : undefined);
    const qrUrl =
      (payload as any)?.refs?.qr_png ??
      (uuid ? `https://xumm.app/sign/${uuid}.png` : undefined);

    if (!uuid || !openUrl) {
      return NextResponse.json(
        { error: 'Failed to create Xumm payload' },
        { status: 502 }
      );
    }

    // Persist pay_request if linkId provided
    let requestId: string | undefined;
    if (linkId) {
      const sb = getSb();
      const { data, error } = await sb
        .from('pay_requests')
        .insert({
          payment_link_id: linkId,
          xumm_uuid: uuid,
          open_url: openUrl,
          qr_url: qrUrl ?? null,
          status: 'awaiting',
        })
        .select('id')
        .single();

      if (!error && data) requestId = data.id as string;
    }

    return NextResponse.json({
      uuid,
      openUrl,
      qrUrl,
      requestId,
    });
  } catch (err: any) {
    console.error('xumm create error:', err?.message ?? err);
    return NextResponse.json(
      { error: 'Xumm create failed' },
      { status: 500 }
    );
  }
}
