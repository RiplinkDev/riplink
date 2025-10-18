// app/api/receipts/[hash]/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request, ctx: any) {
  const p = ctx?.params && typeof ctx.params.then === "function" ? await ctx.params : ctx.params;
  const hash: string | undefined = p?.hash;

  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;

  const name = `Riplink Receipt #${hash?.slice(0, 8) ?? "????"}`;
  const description = `Proof of payment on XRPL Testnet. TX: ${hash ?? "unknown"}`;

  const imageSvg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'>
      <defs>
        <linearGradient id='g' x1='0' x2='1'>
          <stop offset='0%' stop-color='#60a5fa'/>
          <stop offset='50%' stop-color='#8b5cf6'/>
          <stop offset='100%' stop-color='#22d3ee'/>
        </linearGradient>
      </defs>
      <rect width='800' height='400' fill='black'/>
      <circle cx='120' cy='120' r='70' fill='url(#g)'/>
      <text x='220' y='120' font-size='32' fill='white' font-family='Inter,system-ui,sans-serif'>Riplink Receipt</text>
      <text x='220' y='165' font-size='18' fill='#cbd5e1' font-family='Inter,system-ui,sans-serif'>TX: ${hash ?? "-"}</text>
      <text x='220' y='205' font-size='14' fill='#94a3b8' font-family='Inter,system-ui,sans-serif'>${origin}</text>
    </svg>`.replace(/\n\s+/g, " ");

  const metadata = {
    name,
    description,
    image: `data:image/svg+xml;base64,${Buffer.from(imageSvg, "utf8").toString("base64")}`,
    external_url: `${origin}/success/${hash ?? ""}`,
  };

  return NextResponse.json(metadata, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
