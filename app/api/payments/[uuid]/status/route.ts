export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getXumm } from "@/lib/xumm"; // if you expose a helper; otherwise inline like above
import { getSb } from "@/lib/supabase"; // if you still want to update pay_requests with service role; can switch later

type Status = "awaiting" | "signed" | "cancelled" | "expired";

export async function GET(
  _req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const xumm = getXumm();
    const { uuid } = params;

    const res = await xumm.payload.get(uuid);
    const meta = res?.meta;

    const status: Status = meta?.signed
      ? "signed"
      : meta?.cancelled
      ? "cancelled"
      : meta?.expired
      ? "expired"
      : "awaiting";

    const txHash = meta?.signed
      ? (res as any)?.response?.txid ?? (res as any)?.response?.hash ?? null
      : null;

    // Best-effort update if you keep pay_requests
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
        .eq("xumm_uuid", uuid);
    } catch {}

    return NextResponse.json({ status, txHash });
  } catch {
    return NextResponse.json(
      { error: "Status check failed" },
      { status: 500 }
    );
  }
}
