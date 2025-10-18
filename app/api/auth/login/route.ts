// /app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { getCookieName, makeToken, validToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { pass } = await req.json().catch(() => ({} as any));
  if (!process.env.DASHBOARD_PASS) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  if (!pass) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }
  if (pass !== process.env.DASHBOARD_PASS) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = makeToken(pass);
  if (!validToken(token)) {
    return NextResponse.json({ error: "Auth failed" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getCookieName(), token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
