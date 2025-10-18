// /app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  // Clear cookie
  res.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`
  );
  return res;
}
