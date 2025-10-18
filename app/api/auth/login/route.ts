// /app/api/auth/login/route.ts
export const runtime = "nodejs";               // ensure Node (process.env available)
export const dynamic = "force-dynamic";        // no static caching

import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, signCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const password = body?.password;

    const expected = process.env.DASHBOARD_PASS;
    const secret = process.env.DASHBOARD_COOKIE_SECRET;

    if (!expected || !secret) {
      // Tell us *which* is missing (without leaking values)
      const missing = [
        !expected ? "DASHBOARD_PASS" : null,
        !secret ? "DASHBOARD_COOKIE_SECRET" : null,
      ].filter(Boolean);
      return NextResponse.json(
        { error: "Server not configured", missing },
        { status: 500 }
      );
    }

    if (!password || password !== expected) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const ttl = Number(process.env.DASHBOARD_SESSION_TTL_SEC || 60 * 60 * 2);
    const value = signCookie(secret, ttl);

    const res = NextResponse.json({ ok: true });
    res.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${ttl}`
    );
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Login error" }, { status: 500 });
  }
}
