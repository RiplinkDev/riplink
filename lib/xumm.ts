// lib/xumm.ts
// Server-only helper for Xumm. Avoids throwing at import-time so Next build never fails.
// Every API route that uses this must run with `export const runtime = 'nodejs'`.

import { XummSdk } from "xumm-sdk";

let _xumm: XummSdk | null = null;

/** Create (or reuse) a singleton Xumm SDK, validating env at call time. */
export function getXumm(): XummSdk {
  const apiKey = process.env.XUMM_API_KEY;
  const apiSecret = process.env.XUMM_API_SECRET;

  if (!apiKey || !apiSecret) {
    // Throw at *runtime* (in the API route), not when importing this module.
    throw new Error(
      "XUMM credentials not configured. Set XUMM_API_KEY and XUMM_API_SECRET."
    );
  }

  if (_xumm) return _xumm;
  _xumm = new XummSdk(apiKey, apiSecret);
  return _xumm;
}

/** UTF-8 → HEX (uppercase) for XRPL memos and URIs. */
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
