// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, signCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = body?.password;

  const expected = process.env.DASHBOARD_PASS;
  const secret = process.env.DASHBOARD_COOKIE_SECRET;

  if (!expected || !secret) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 }
    );
  }

  if (!password || password !== expected) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const value = signCookie(secret);

  const res = NextResponse.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=`
      .concat(String(process.env.DASHBOARD_SESSION_TTL_SEC || 60 * 60 * 2))
  );
  return res;
}
