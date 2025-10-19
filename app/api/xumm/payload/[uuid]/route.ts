export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getXumm } from "@/lib/xumm";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ uuid: string }> } | { params: { uuid: string } }
) {
  // Support both edge/runtime param shapes
  const p: any =
    (ctx as any)?.params && typeof (ctx as any).params.then === "function"
      ? await (ctx as any).params
      : (ctx as any).params;

  const uuid: string | undefined = p?.uuid;
  if (!uuid) return NextResponse.json({ error: "missing uuid" }, { status: 400 });

  try {
    const xumm = getXumm();
    const res = await xumm.payload.get(uuid);

    const expired = !!res?.meta?.expired;
    const signed = !!res?.meta?.signed;
    const cancelled = !!res?.meta?.cancelled;

    if (expired) return NextResponse.json({ signed: false, expired: true });

    if (signed) {
      const txHash =
        (res as any)?.response?.txid ??
        (res as any)?.response?.hash ??
        null;
      return NextResponse.json({ signed: true, txHash, cancelled: false, expired: false });
    }

    return NextResponse.json({ signed: false, cancelled, expired: false });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "poll error" }, { status: 500 });
  }
}
