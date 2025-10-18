// /middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { validToken, getCookieName } from "./lib/auth";

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;

  // Protect dashboard (add more protected paths if needed)
  const protectedPaths = ["/dashboard"];
  const isProtected = protectedPaths.some((p) => path === p || path.startsWith(p + "/"));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(getCookieName())?.value;
  if (validToken(token)) return NextResponse.next();

  url.pathname = "/login";
  url.searchParams.set("next", path);
  return NextResponse.redirect(url);
}

// Limit middleware to just the pages we care about to avoid slowing api/static
export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
