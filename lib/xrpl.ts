// lib/xrpl.ts - XRPL network utilities (HTTP JSON-RPC)
// Use Node runtime for any route that depends on this.

export const XRPL_NETWORK = (process.env.XRPL_NETWORK || "testnet").toLowerCase();

export const XRPL_ENDPOINTS = {
  mainnet: "https://xrplcluster.com",                  // JSON-RPC over HTTPS
  testnet: "https://s.altnet.rippletest.net:51234",    // JSON-RPC over HTTPS
  devnet: "https://s.devnet.rippletest.net:51234",
} as const;

export function getXrplEndpoint(): string {
  const key = XRPL_NETWORK as keyof typeof XRPL_ENDPOINTS;
  return XRPL_ENDPOINTS[key] || XRPL_ENDPOINTS.testnet;
}

export function getExplorerUrl(txHash: string): string {
  if (XRPL_NETWORK === "mainnet") {
    return `https://livenet.xrpl.org/transactions/${txHash}`;
  }
  if (XRPL_NETWORK === "devnet") {
    return `https://devnet.xrpl.org/transactions/${txHash}`;
  }
  return `https://testnet.xrpl.org/transactions/${txHash}`;
}

type TxResponse =
  | { found: false }
  | {
      found: true;
      hash: string;
      validated: boolean;
      ledger_index?: number;
      destination?: string;
      account?: string;
      amountXrp: number | null;
      memo?: string;
      raw: any;
    };

/** Fetch a transaction by hash using XRPL JSON-RPC. */
export async function fetchTransaction(hash: string): Promise<TxResponse> {
  const endpoint = getXrplEndpoint();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // 10s safety

  try {
    const rpcBody = {
      method: "tx",
      params: [{ transaction: hash, binary: false }],
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(rpcBody),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`XRPL RPC HTTP ${res.status}`);
    }

    const json = await res.json();
    const r = json?.result;

    if (r?.error === "txnNotFound") {
      return { found: false };
    }
    if (!r) {
      throw new Error("XRPL RPC: empty result");
    }

    const validated: boolean = !!r.validated;
    const ledger_index: number | undefined = r.ledger_index;

    // delivered_amount is preferred when present (handles partial payments)
    const delivered = r?.meta?.delivered_amount ?? r?.Amount ?? null;

    let amountXrp: number | null = null;
    if (typeof delivered === "string") {
      const drops = Number(delivered);
      amountXrp = Number.isFinite(drops) ? drops / 1_000_000 : null;
    } else if (typeof delivered === "number") {
      amountXrp = delivered / 1_000_000;
    } else if (typeof delivered === "object" && delivered !== null) {
      // Issued currency object { value, currency, issuer } — not XRP
      amountXrp = null;
    }

    // Extract first memo (if present) and decode from hex.
    let memo: string | undefined;
    const memos = r?.Memos || [];
    if (Array.isArray(memos) && memos[0]?.Memo?.MemoData) {
      try {
        const hex = memos[0].Memo.MemoData as string;
        memo = Buffer.from(hex, "hex").toString("utf8");
      } catch {
        memo = undefined;
      }
    }

    return {
      found: true,
      hash,
      validated,
      ledger_index,
      destination: r?.Destination,
      account: r?.Account,
      amountXrp,
      memo,
      raw: r,
    };
  } finally {
    clearTimeout(timeout);
  }
}
