// lib/xrpl.ts - XRPL network utilities

export const XRPL_NETWORK = process.env.XRPL_NETWORK || "testnet"

export const XRPL_ENDPOINTS = {
  mainnet: "https://xrplcluster.com",
  testnet: "https://s.altnet.rippletest.net:51234",
  devnet: "https://s.devnet.rippletest.net:51234",
} as const

export function getXrplEndpoint(): string {
  const network = XRPL_NETWORK as keyof typeof XRPL_ENDPOINTS
  return XRPL_ENDPOINTS[network] || XRPL_ENDPOINTS.testnet
}

export function getExplorerUrl(txHash: string): string {
  if (XRPL_NETWORK === "mainnet") {
    return `https://livenet.xrpl.org/transactions/${txHash}`
  }
  return `https://testnet.xrpl.org/transactions/${txHash}`
}

// Fetch transaction from XRPL
export async function fetchTransaction(hash: string) {
  const endpoint = getXrplEndpoint()

  const rpcBody = {
    method: "tx",
    params: [{ transaction: hash, binary: false }],
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(rpcBody),
  })

  if (!res.ok) {
    throw new Error(`XRPL RPC error: ${res.status}`)
  }

  const json = await res.json()

  // If tx not yet found, XRPL returns error "txnNotFound"
  if (json?.result?.error === "txnNotFound") {
    return { found: false }
  }

  const r = json?.result
  if (!r) {
    throw new Error("No result from XRPL")
  }

  const validated: boolean = !!r.validated
  const ledger_index: number | undefined = r.ledger_index
  const meta = r.meta || {}
  const delivered = meta?.delivered_amount ?? r?.Amount ?? null

  // Normalize amount when it's a string in drops
  let amountXrp: number | null = null
  if (typeof delivered === "string") {
    const drops = Number(delivered)
    amountXrp = Number.isFinite(drops) ? drops / 1_000_000 : null
  } else if (typeof delivered === "number") {
    amountXrp = delivered / 1_000_000
  }

  // Extract memos (if any)
  let memo: string | undefined
  const memos = r?.Memos || []
  if (Array.isArray(memos) && memos[0]?.Memo?.MemoData) {
    try {
      const hex = memos[0].Memo.MemoData as string
      memo = Buffer.from(hex, "hex").toString("utf8")
    } catch {}
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
  }
}
