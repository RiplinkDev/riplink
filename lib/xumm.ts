// /lib/xumm.ts
// Server-only Xumm helpers. Safe to import anywhere; only throws at call-time.
// Every API route using this should set: export const runtime = 'nodejs';

import "server-only";
import { XummSdk } from "xumm-sdk";

let _xumm: XummSdk | null = null;

/** Check if Xumm env vars are present (without throwing). */
export function isXummConfigured(): boolean {
  return Boolean(process.env.XUMM_API_KEY && process.env.XUMM_API_SECRET);
}

/** Get a cached Xumm SDK instance. Throws at *runtime* if env is missing. */
export function getXumm(): XummSdk {
  const apiKey = process.env.XUMM_API_KEY;
  const apiSecret = process.env.XUMM_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "XUMM credentials not configured. Set XUMM_API_KEY and XUMM_API_SECRET in your environment."
    );
  }
  if (_xumm) return _xumm;

  _xumm = new XummSdk(apiKey, apiSecret);
  return _xumm;
}

/**
 * Safe variant: returns a client when configured, otherwise `null`.
 * Useful for optional features (e.g., NFT receipt minting) without failing the build.
 */
export function tryGetXumm(): XummSdk | null {
  if (!isXummConfigured()) return null;
  if (_xumm) return _xumm;

  _xumm = new XummSdk(process.env.XUMM_API_KEY!, process.env.XUMM_API_SECRET!);
  return _xumm;
}

/** UTF-8 → HEX (uppercase) for XRPL memos/URIs. */
export function strToHex(s: string): string {
  return Buffer.from(s, "utf8").toString("hex").toUpperCase();
}

/** HEX → UTF-8 (best effort). */
export function hexToStr(hex: string): string {
  try {
    return Buffer.from(hex, "hex").toString("utf8");
  } catch {
    return "";
  }
}
