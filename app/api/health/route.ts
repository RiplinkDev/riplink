// /app/api/health/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getXrplEndpoint } from "@/lib/xrpl";

export async function GET() {
  const checks: Record<string, any> = {
    env: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      XUMM_API_KEY: !!process.env.XUMM_API_KEY,
      XUMM_API_SECRET: !!process.env.XUMM_API_SECRET,
    },
    supabase: { ok: false },
    xrpl: { ok: false, network: process.env.XRPL_NETWORK || "testnet" },
  };

  // Supabase “SELECT 1” style check
  try {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("payment_links").select("id").limit(1);
    if (!error) checks.supabase.ok = true;
    else checks.supabase.error = error.message;
  } catch (e: any) {
    checks.supabase.error = e?.message || "supabase-failed";
  }

  // XRPL server_info check
  try {
    const endpoint = getXrplEndpoint();
    const body = { method: "server_info", params: [{}] };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json?.result?.info) {
      checks.xrpl.ok = true;
      checks.xrpl.server = json.result.info?.hostid ?? "ok";
      checks.xrpl.complete_ledgers = json.result.info?.complete_ledgers ?? "";
    } else {
      checks.xrpl.error = "no-server-info";
    }
  } catch (e: any) {
    checks.xrpl.error = e?.message || "xrpl-failed";
  }

  // All good if both critical checks are ok
  const ok = checks.supabase.ok && checks.xrpl.ok;

  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
