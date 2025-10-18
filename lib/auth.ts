// /lib/auth.ts
// Small, edge-safe cookie signer for the dashboard login.

export const COOKIE_NAME = "riplink_auth";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const enc = new TextEncoder();

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  // base64url
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let res = 0;
  for (let i = 0; i < a.length; i++) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return res === 0;
}

export async function signCookie(value: string, secret: string) {
  const sig = await hmac(value, secret);
  return `${value}.${sig}`;
}

export async function verifyCookie(signed: string, secret: string) {
  const i = signed.lastIndexOf(".");
  if (i <= 0) return null;
  const value = signed.slice(0, i);
  const sig = signed.slice(i + 1);
  const expected = await hmac(value, secret);
  return safeEqual(sig, expected) ? value : null;
}
