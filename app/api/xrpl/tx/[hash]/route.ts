import { type NextRequest, NextResponse } from "next/server"
import { fetchTransaction } from "@/lib/xrpl"

// Next.js 15 typing: params arrives as a Promise in app routes.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ hash: string }> }) {
  try {
    const { hash } = await ctx.params
    const result = await fetchTransaction(hash)

    if (!result.found) {
      return NextResponse.json({ ok: true, found: false })
    }

    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "tx route error" }, { status: 500 })
  }
}
