import { XummSdk } from "xumm-sdk"

const apiKey = process.env.XUMM_API_KEY
const apiSecret = process.env.XUMM_API_SECRET

if (!apiKey || !apiSecret) {
  throw new Error("XUMM credentials not configured. Please set XUMM_API_KEY and XUMM_API_SECRET environment variables.")
}

// Server-only XUMM SDK instance
export const xumm = new XummSdk(apiKey, apiSecret)

// UTF-8 -> HEX utility for XRPL memos and URIs
export function strToHex(s: string): string {
  return Buffer.from(s, "utf8").toString("hex").toUpperCase()
}
