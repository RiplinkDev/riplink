// /lib/auth.ts
import { createHmac, randomBytes } from "crypto";

export const COOKIE_NAME = "riplink_dash";

/** How long a session lasts (in seconds). Default 2 hours. */
export const SESSION_TTL =
  Number(process.env.DASHBOARD_SESSION_TTL_SEC || 60 * 60 * 2);

/** If the session has < this many seconds left, refresh/roll it. Default 30 min. */
export const SESSION_ROLL_THRESHOLD_SEC =
  Number(process.env.DASHBOARD_SESSION_ROLL_THRESHOLD_SEC || 60 * 30);

type Payload = {
  iat: number; // issued at (sec)
  exp: number; // expiry (sec)
  jti: string; // random id to make each cookie unique (prevents replay confusion)
};

function b64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlJson(obj: unknown) {
  return b64url(Buffer.from(JSON.stringify(obj)));
}

function hmacSHA256(secret: string, data: string) {
  return createHmac("sha256", secret).update(data).digest();
}

/** Create a signed cookie value with exp. */
export function signCookie(secret: string, ttlSec = SESSION_TTL) {
  const now = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    iat: now,
    exp: now + ttlSec,
    jti: b64url(randomBytes(12)),
  };
  const header = { alg: "HS256", typ: "JWT" }; // JWT-like, but minimal
  const unsigned = `${b64urlJson(header)}.${b64urlJson(payload)}`;
  const sig = b64url(hmacSHA256(secret, unsigned));
  return `${unsigned}.${sig}`;
}

/** Verify cookie signature and parse payload. Returns payload or null. */
export function verifyCookie(raw: string, secret: string): Payload | null {
  const parts = raw.split(".");
  if (parts.length !== 3) return null;

  const [h, p, s] = parts;
  const expected = b64url(hmacSHA256(secret, `${h}.${p}`));
  if (s !== expected) return null;

  try {
    const json = Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const payload = JSON.parse(json) as Payload;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || now >= payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/** True if the session is nearing expiry and should be rolled. */
export function shouldRoll(payload: Payload) {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = payload.exp - now;
  return timeLeft <= SESSION_ROLL_THRESHOLD_SEC;
}
