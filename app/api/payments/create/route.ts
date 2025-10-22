export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { XummSdk } from "xumm-sdk";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase-server-user";
import { strToHex } from "@/lib/xumm";

// Basic XRPL address & payload schema
const CreatePaymentSchema = z.object({
  linkId: z.string().uuid().optional(),
  destination: z
    .string()
    .regex(/^r[1-9A-HJ-NP-Za-km-z]{24,35}$/)
    .optional(),
  amountXrp: z.number().positive().max(1_000_000).optional(),
  memo: z.string().max(128).optional(),
}).refine(
  (v) => v.linkId || (v.destination && v.amountXrp),
  { message: "Provide linkId OR (destination + amountXrp)" }
);

function getXumm() {
  const key = process.env.XUMM_API_KEY!;
  const sec = process.env.XUMM_API_SECRET!;
  if (!key || !sec) throw new Error("XUMM not configured");
  return new XummSdk(key, sec);
}

export async function POST(req: NextRequest) {
  try {
    // Must be an authenticated user
    const sb = getServerSupabase();
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const input = CreatePaymentSchema.parse(body);

    // If linkId is provided, fetch canonical details from DB (RLS will scope)
    let dest = input.destination as string | undefined;
    let amount = input.amountXrp as number | undefined;
    let memo = input.memo ?? undefined;

    if (input.linkId) {
      const { data: link, error } = await sb
        .from("payment_links")
        .select("destination_address, amount_drops, memo")
        .eq("id", input.linkId)
        .single();

      if (error || !link) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
      }
      dest = link.destination_address;
      amount = link.amount_drops / 1_000_000;
      memo = link.memo ?? undefined;
    }

    if (!dest || !amount) {
      return NextResponse.json(
        { error: "Missing destination or amount" },
        { status: 400 }
      );
    }

    const xumm = getXumm();
    const created = await xumm.payload.create({
      txjson: {
        TransactionType: "Payment",
        Destination: dest,
        Amount: String(Math.round(amount * 1_000_000)),
        Memos: memo
          ? [{ Memo: { MemoData: strToHex(memo.slice(0, 128)) } }]
          : undefined,
      },
      options: { expire: 300 },
    });

    // (optional) persist a request row to track UI state, using **user-scoped** client
    await sb.from("pay_requests").insert({
      payment_link_id: input.linkId ?? null,
      xumm_uuid: created.uuid,
      open_url: created.next?.always ?? null,
      qr_url: created.refs?.qr_png ?? null,
      status: "awaiting",
    });

    return NextResponse.json({
      uuid: created.uuid,
      next: created.next?.always,
      qr: created.refs?.qr_png,
    });
  } catch (err: any) {
    const message = err?.issues?.[0]?.message || err?.message || "create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
