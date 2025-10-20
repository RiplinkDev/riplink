// /middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// We don't gate routes here anymore. Supabase session + server components
// will handle access (and the login page auto-redirects if you're already signed in).
export const config = { matcher: [] };

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}
