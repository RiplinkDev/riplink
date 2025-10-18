import { type NextRequest, NextResponse } from "next/server"

function strToHex(str: string): string {
  return Buffer.from(str, "utf8").toString("hex").toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const { destination, amountXrp, memo } = await req.json()

    if (!destination || !amountXrp) {
      return NextResponse.json({ error: "destination & amountXrp required" }, { status: 400 })
    }

    const drops = Math.round(Number(amountXrp) * 1_000_000)

    const txjson: any = {
      TransactionType: "Payment",
      Destination: destination,
      Amount: String(drops),
    }

    if (memo && memo.trim()) {
      txjson.Memos = [
        {
          Memo: {
            MemoData: strToHex(memo.trim()),
          },
        },
      ]
    }

    // Convert transaction JSON to hex for Xaman deeplink
    const txJsonString = JSON.stringify(txjson)
    const txHex = Buffer.from(txJsonString, "utf-8").toString("hex")

    // Create Xaman deeplink URL
    const deeplink = `https://xaman.app/detect/request:${txHex}`

    // Generate a simple UUID for tracking
    const uuid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // For QR code, we can use a QR code generator service or the deeplink itself
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(deeplink)}`

    return NextResponse.json({
      uuid,
      openUrl: deeplink,
      qrUrl,
      deeplink,
      ws: null, // No WebSocket with this approach
    })
  } catch (e: any) {
    console.error("[v0] Payment link creation error:", e)
    return NextResponse.json(
      {
        error: "Failed to create payment request",
        message: e?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
