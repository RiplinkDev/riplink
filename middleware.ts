// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyCookie } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*"], // Add more protected prefixes here
};

export async function middleware(req: NextRequest) {
  try {
    const secret = process.env.DASHBOARD_COOKIE_SECRET;
    const nextUrl = new URL(`/login?next=${encodeURIComponent(req.nextUrl.pathname)}`, req.url);

    if (!secret) {
      console.error("Missing DASHBOARD_COOKIE_SECRET");
      return NextResponse.redirect(nextUrl);
    }

    const raw = req.cookies.get(COOKIE_NAME)?.value;
    if (!raw) return NextResponse.redirect(nextUrl);

    const value = await verifyCookie(raw, secret);
    if (!value) {
      const res = NextResponse.redirect(nextUrl);
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    // Optionally: check expiration inside value if you encode one
    return NextResponse.next();
  } catch (err) {
    console.error("middleware error:", err);
    const url = new URL(`/login?next=${encodeURIComponent(req.nextUrl.pathname)}`, req.url);
    return NextResponse.redirect(url);
  }
}
