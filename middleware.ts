// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export const config = {
  // protect dashboard + anything under it
  matcher: ["/dashboard/:path*"],
};

export function middleware(req: NextRequest) {
  // If cookie missing, redirect to /login with ?next=<current path>
  const hasGate = !!req.cookies.get(COOKIE_NAME)?.value;
  if (!hasGate) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
