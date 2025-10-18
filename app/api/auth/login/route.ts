// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, safeEqual } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));

  const envPass = (process.env.DASHBOARD_PASS || "").trim();
  if (!envPass) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 }
    );
  }

  const ok = password && safeEqual(String(password).trim(), envPass);
  if (!ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Grant access: set a short-lived cookie (2 hours). No crypto, just a gate.
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "ok", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });
  return res;
}
