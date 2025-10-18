// /lib/auth.ts
import crypto from "crypto";

const COOKIE_NAME = "riplink_auth";

export function getCookieName() {
  return COOKIE_NAME;
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function makeToken(pass: string) {
  const secret = process.env.DASHBOARD_COOKIE_SECRET || "dev-secret";
  return sha256(`${pass}:${secret}`);
}

export function validToken(token?: string | null) {
  if (!token) return false;
  const expected = makeToken(process.env.DASHBOARD_PASS || "");
  return Boolean(process.env.DASHBOARD_PASS) && token === expected;
}
