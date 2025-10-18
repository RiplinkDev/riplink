export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getXumm } from '@/lib/xumm';

export async function GET(
  req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const xumm = getXumm();
    const { uuid } = params;

    const result = await xumm.payload.get(uuid);

    const meta = result?.meta;
    const txid = meta?.resolved && meta?.payload_uuidv4
      ? result.response.txid
      : null;

    return NextResponse.json({
      signed: meta?.signed || false,
      cancelled: meta?.cancelled || false,
      expired: meta?.expired || false,
      txid,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}
