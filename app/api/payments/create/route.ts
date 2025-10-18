export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getXumm, strToHex } from '@/lib/xumm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination, amountXrp, memo } = body;

    if (!destination || !amountXrp)
      return NextResponse.json({ error: 'Missing destination or amount' }, { status: 400 });

    const xumm = getXumm();

    const payload = {
      txjson: {
        TransactionType: 'Payment',
        Destination: destination,
        Amount: String(amountXrp * 1_000_000),
        Memos: memo
          ? [{ Memo: { MemoData: strToHex(memo.slice(0, 128)) } }]
          : undefined,
      },
    };

    const created = await xumm.payload.create(payload);
    return NextResponse.json({
      uuid: created.uuid,
      next: created.next.always,
      qr: created.refs.qr_png,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Xumm create failed' }, { status: 500 });
  }
}
