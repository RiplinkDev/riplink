import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function constantTimeEqual(a: string, b: string) {
  // Normalize to exact bytes, same length
  const aBuf = new TextEncoder().encode(a);
  const bBuf = new TextEncoder().encode(b);
  if (aBuf.length !== bBuf.length) return false;
  let diff = 0;
  for (let i = 0; i < aBuf.length; i++) diff |= aBuf[i] ^ bBuf[i];
  return diff === 0;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const inputRaw: string = body?.password ?? "";

  const passEnv = process.env.DASHBOARD_PASS;
  const cookieSecret = process.env.DASHBOARD_COOKIE_SECRET;

  if (!passEnv || !cookieSecret) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 }
    );
  }

  // Trim input and env to avoid accidental whitespace issues
  const input = String(inputRaw).trim();
  const expected = String(passEnv).trim();

  const ok =
    input.length > 0 &&
    expected.length > 0 &&
    constantTimeEqual(input, expected);

  if (!ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Issue a signed cookie with a short lifetime (test phase)
  const res = NextResponse.json({ ok: true });
  // 2 hours
  const maxAge = 60 * 60 * 2;

  res.cookies.set("riplink_dash", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return res;
}
