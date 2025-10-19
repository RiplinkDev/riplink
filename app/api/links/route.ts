export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSb } from '@/lib/supabase';

const WORKSPACE_ID = process.env.RIPLINK_WORKSPACE_ID!;

function slugify(n = 6) {
  return Math.random().toString(36).slice(2, 2 + n);
}

export async function POST(req: NextRequest) {
  try {
    const { title, destination, amountXrp, memo } = await req.json();

    if (!destination || !amountXrp) {
      return NextResponse.json({ error: 'destination and amountXrp required' }, { status: 400 });
    }
    const amount_drops = Math.round(Number(amountXrp) * 1_000_000);

    const sb = getSb();
    const slug = slugify(8);

    const { data, error } = await sb
      .from('payment_links')
      .insert({
        workspace_id: WORKSPACE_ID,
        title: title || 'Payment',
        destination_address: destination,
        amount_drops,
        memo: memo || null,
        status: 'active',
        slug
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ link: data, payUrl: `/pay/${data.slug}` });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'create link failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sb = getSb();
    const { data, error } = await sb
      .from('payment_links')
      .select(`
        id, title, destination_address, amount_drops, memo, status, slug, created_at,
        pay_requests!left ( id, status )
      `)
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // compute paid count
    const links = (data || []).map((l: any) => ({
      ...l,
      paidCount: (l.pay_requests || []).filter((r: any) => r.status === 'signed').length
    }));

    return NextResponse.json({ links });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'list failed' }, { status: 500 });
  }
}
