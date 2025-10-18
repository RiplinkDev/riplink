// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyCookie, signCookie, shouldRoll } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*"], // protect dashboard
};

export async function middleware(req: NextRequest) {
  const secret = process.env.DASHBOARD_COOKIE_SECRET;
  const loginUrl = new URL(
    `/login?next=${encodeURIComponent(req.nextUrl.pathname)}`,
    req.url
  );

  if (!secret) {
    // Fail closed but send to login for now
    return NextResponse.redirect(loginUrl);
  }

  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return NextResponse.redirect(loginUrl);

  const payload = verifyCookie(raw, secret);
  if (!payload) {
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  // Optional: roll the cookie if it's close to expiring
  if (shouldRoll(payload)) {
    const rolled = signCookie(secret);
    const res = NextResponse.next();
    res.headers.append(
      "Set-Cookie",
      `${COOKIE_NAME}=${rolled}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${
        process.env.DASHBOARD_SESSION_TTL_SEC || 60 * 60 * 2
      }`
    );
    return res;
  }

  return NextResponse.next();
}
