export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSb } from '@/lib/supabase';

const WORKSPACE_ID = process.env.RIPLINK_WORKSPACE_ID!;

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sb = getSb();
    const { data, error } = await sb
      .from('payment_links')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('id', params.id)
      .single();
    if (error) throw error;
    return NextResponse.json({ link: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'get failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const sb = getSb();
    const { data, error } = await sb
      .from('payment_links')
      .update({
        title: body.title,
        memo: body.memo,
        status: body.status,
      })
      .eq('workspace_id', WORKSPACE_ID)
      .eq('id', params.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ link: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'update failed' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sb = getSb();
    const { error } = await sb
      .from('payment_links')
      .delete()
      .eq('workspace_id', WORKSPACE_ID)
      .eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'delete failed' }, { status: 500 });
  }
}
