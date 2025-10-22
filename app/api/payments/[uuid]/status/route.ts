export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getXumm } from "@/lib/xumm";
import { getSb } from "@/lib/supabase";

type Status = "awaiting" | "signed" | "cancelled" | "expired";

export async function GET(
  _req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const xumm = getXumm();
    const { uuid } = params;

    const res = await xumm.payload.get(uuid);
    const meta = (res as any)?.meta;

    const status: Status = meta?.signed
      ? "signed"
      : meta?.cancelled
      ? "cancelled"
      : meta?.expired
      ? "expired"
      : "awaiting";

    // prefer txid, then hash, then id if present
    const txHash =
      meta?.signed
        ? (res as any)?.response?.txid ??
          (res as any)?.response?.hash ??
          (res as any)?.response?.id ??
          null
        : null;

    // Best-effort update of pay_requests (scoped to exactly one row)
    try {
      const sb = getSb();
      await sb
        .from("pay_requests")
        .update({
          status,
          tx_hash: txHash,
          resolved_at:
            status === "signed" || status === "cancelled" || status === "expired"
              ? new Date().toISOString()
              : null,
        })
        .eq("xumm_uuid", uuid)
        .limit(1); // optional safety
    } catch {
      // ignore non-fatal persistence errors
    }

    return NextResponse.json({ status, txHash });
  } catch {
    return NextResponse.json({ error: "Status check failed" }, { status: 500 });
  }
}
