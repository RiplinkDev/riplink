import { NextResponse } from "next/server"
import { xumm, strToHex } from "@/lib/xumm"

export async function GET(_req: Request, ctx: any) {
  const p = ctx?.params && typeof ctx.params.then === "function" ? await ctx.params : ctx.params
  const uuid: string | undefined = p?.uuid

  if (!uuid) return NextResponse.json({ error: "missing uuid" }, { status: 400 })

  try {
    const res = await xumm.payload.get(uuid)
    if (res?.meta?.expired) return NextResponse.json({ signed: false, expired: true })
    if (res?.meta?.signed) {
      const txHash = (res as any).response?.txid || (res as any).response?.hash || null
      return NextResponse.json({ signed: true, txHash })
    }
    return NextResponse.json({ signed: false })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "poll error" }, { status: 500 })
  }
}
