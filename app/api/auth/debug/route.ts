import { NextResponse } from "next/server";
export const runtime = "edge";

// This endpoint is SAFE: it never shows the secret values.
// It only tells you whether they're present and basic lengths.
export async function GET() {
  const pass = process.env.DASHBOARD_PASS ?? "";
  const secret = process.env.DASHBOARD_COOKIE_SECRET ?? "";

  return NextResponse.json({
    hasPass: Boolean(pass),
    passLength: pass ? pass.trim().length : 0,
    hasCookieSecret: Boolean(secret),
    cookieSecretLen: secret ? secret.length : 0,
  });
}
