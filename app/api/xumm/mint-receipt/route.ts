import { type NextRequest, NextResponse } from "next/server"
import { xumm, strToHex } from "@/lib/xumm"

export async function POST(req: NextRequest) {
  try {
    const { txHash, account } = await req.json()

    if (!txHash || !account) {
      return NextResponse.json({ error: "txHash and account required" }, { status: 400 })
    }

    // Build metadata URL for the NFT (points to your JSON receipt endpoint)
    const url = new URL(req.url)
    const metaUrl = `${url.protocol}//${url.host}/api/receipts/${txHash}`

    const txjson: any = {
      TransactionType: "NFTokenMint",
      Flags: 8, // tfTransferable
      NFTokenTaxon: 0,
      URI: strToHex(metaUrl),
    }

    // Create a sign request so the payer mints to themselves
    const result = await xumm.payload.create({
      txjson,
      options: { submit: true, expire: 180 },
      custom_meta: {
        instruction: "Mint your Riplink Receipt NFT on XRPL testnet",
        signers: [account],
      },
    })

    if (!result) {
      return NextResponse.json({ error: "Failed to create Xumm payload" }, { status: 502 })
    }

    const uuid = (result as any).uuid as string | undefined
    const openUrl = (result as any)?.next?.always ?? (uuid ? `https://xumm.app/sign/${uuid}` : undefined)

    if (!uuid || !openUrl) {
      return NextResponse.json({ error: "Invalid response from Xumm (missing uuid/openUrl)" }, { status: 502 })
    }

    return NextResponse.json({
      uuid,
      openUrl,
      qrUrl: `https://xumm.app/sign/${uuid}.png`,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "mint error" }, { status: 500 })
  }
}
