// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

// Protect both dashboard and create routes
export const config = {
  matcher: ["/dashboard/:path*", "/create/:path*"],
};

export function middleware(req: NextRequest) {
  try {
    const cookie = req.cookies.get(COOKIE_NAME)?.value;

    // same lightweight gate you already use
    if (cookie === "1") return NextResponse.next();

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  } catch {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}
