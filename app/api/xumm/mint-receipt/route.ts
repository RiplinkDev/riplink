// app/api/xumm/mint-receipt/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { XummSdk } from "xumm-sdk";

// Ensure Node runtime + no prerendering (prevents build from importing/exec-ing the handler)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** UTF-8 string → hex (XRPL URIs use hex-encoded bytes) */
function strToHex(input: string): string {
  return Buffer.from(input, "utf8").toString("hex");
}

/** Create a Xumm client only when secrets exist; otherwise return null (don’t throw). */
function getXummClient() {
  const key =
    process.env.XUMM_API_KEY ||
    process.env.NEXT_PUBLIC_XUMM_API_KEY || // fallback if you mirror the key
    "";
  const secret = process.env.XUMM_API_SECRET || "";

  if (!key || !secret) return null;
  return new XummSdk(key, secret);
}

export async function POST(req: NextRequest) {
  try {
    // Guard: ensure request body has what we need
    const { txHash, account } = await req.json();
    if (!txHash || !account) {
      return NextResponse.json(
        { error: "txHash and account required" },
        { status: 400 }
      );
    }

    // Build metadata URL for the NFT (points to your JSON receipt endpoint)
    const here = new URL(req.url);
    const metaUrl = `${here.protocol}//${here.host}/api/receipts/${txHash}`;

    // Build the NFTokenMint txjson
    const txjson: any = {
      TransactionType: "NFTokenMint",
      Flags: 8, // tfTransferable
      NFTokenTaxon: 0,
      URI: strToHex(metaUrl),
    };

    // Lazily construct Xumm client (safe at build time)
    const xumm = getXummClient();
    if (!xumm) {
      // Don’t crash the build—respond gracefully at runtime if not configured
      return NextResponse.json(
        {
          error:
            "Xumm not configured on this environment. Set XUMM_API_KEY and XUMM_API_SECRET in Vercel → Project → Settings → Environment Variables.",
        },
        { status: 503 }
      );
    }

    // Create a sign request so the payer mints to themselves
    const result = await xumm.payload.create({
      txjson,
      options: { submit: true, expire: 180 },
      custom_meta: {
        instruction: "Mint your Riplink Receipt NFT on XRPL testnet",
        signers: [account],
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create Xumm payload" },
        { status: 502 }
      );
    }

    // Xumm SDK types vary; access safely
    const uuid = (result as any).uuid as string | undefined;
    const openUrl =
      (result as any)?.next?.always ??
      (uuid ? `https://xumm.app/sign/${uuid}` : undefined);

    if (!uuid || !openUrl) {
      return NextResponse.json(
        { error: "Invalid response from Xumm (missing uuid/openUrl)" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      uuid,
      openUrl,
      qrUrl: `https://xumm.app/sign/${uuid}.png`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "mint error" },
      { status: 500 }
    );
  }
}
