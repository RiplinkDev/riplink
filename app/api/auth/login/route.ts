// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, COOKIE_MAX_AGE, signCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { password?: string } | null;

  const pass = process.env.DASHBOARD_PASS;
  const secret = process.env.DASHBOARD_COOKIE_SECRET;

  if (!pass || !secret) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 }
    );
  }

  if (!body?.password || body.password !== pass) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Encode a minimal payload you might extend later
  const payload = JSON.stringify({ iat: Date.now() });
  const signed = await signCookie(payload, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: signed,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
