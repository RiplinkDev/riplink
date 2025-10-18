// components/MintReceipt.tsx
"use client"

import { useEffect, useRef, useState } from "react"

type XummPayload = {
  uuid: string
  openUrl: string
  qrUrl: string
}

type Props = {
  txHash: string // XRPL transaction hash for the payment
  destination: string // Wallet that will receive the NFT
}

export default function MintReceipt({ txHash, destination }: Props) {
  const [payload, setPayload] = useState<XummPayload | null>(null)
  const [status, setStatus] = useState<"idle" | "creating" | "awaiting" | "signed" | "expired" | "error">("idle")
  const [err, setErr] = useState<string | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  async function startMint() {
    setErr(null)
    setStatus("creating")
    setPayload(null)

    try {
      const res = await fetch("/api/xumm/mint-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash, destination }),
      })
      const data = await res.json()

      if (!res.ok || !data?.uuid) {
        setStatus("error")
        setErr(typeof data?.error === "string" ? data.error : "Failed to create mint payload")
        return
      }

      setPayload({ uuid: data.uuid, openUrl: data.openUrl, qrUrl: data.qrUrl })
      setStatus("awaiting")
    } catch (e: any) {
      setStatus("error")
      setErr(e?.message || "Network error")
    }
  }

  // Poll Xumm (only when we actually have a uuid)
  useEffect(() => {
    if (status !== "awaiting" || !payload?.uuid) return

    const uuid = payload.uuid // capture non-null
    async function tick() {
      try {
        const res = await fetch(`/api/xumm/payload/${uuid}`)
        const data = await res.json()

        if (data?.expired) {
          setStatus("expired")
          if (pollRef.current) clearInterval(pollRef.current)
        } else if (data?.signed) {
          setStatus("signed")
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // ignore transient poll errors
      }
    }

    pollRef.current = setInterval(tick, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [status, payload?.uuid])

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 text-center">
      <h3 className="text-lg font-semibold">Mint Receipt NFT</h3>
      <p className="text-muted-foreground text-sm mt-1">
        Issue a proof-of-payment NFT for TX:
        <span className="block break-all text-muted-foreground mt-1">{txHash}</span>
      </p>

      <div className="mt-4 flex justify-center">
        <button
          onClick={startMint}
          disabled={status === "creating" || status === "awaiting"}
          className="rounded-xl bg-primary text-primary-foreground font-semibold px-5 py-3 disabled:opacity-60"
        >
          {status === "creating" ? "Preparing…" : "Mint to Wallet"}
        </button>
      </div>

      {err && <p className="text-destructive text-sm mt-3">{err}</p>}

      {payload && (
        <div className="mt-5">
          <p className="text-card-foreground/80 mb-2">Scan with Xaman or tap below:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={payload.qrUrl || "/placeholder.svg"} alt="Xumm QR" className="mx-auto w-52 h-52 rounded bg-white" />
          <a
            href={payload.openUrl}
            className="inline-block mt-3 px-4 py-2 rounded bg-primary text-primary-foreground font-semibold"
          >
            Open in Xumm
          </a>

          <div className="mt-3 text-sm text-muted-foreground">
            Status: {status === "awaiting" && <span className="text-warning">Awaiting signature…</span>}
            {status === "signed" && <span className="text-success">Signed & submitted ✅</span>}
            {status === "expired" && <span className="text-destructive">Expired ❌</span>}
            {status === "error" && <span className="text-destructive">Error</span>}
          </div>
        </div>
      )}
    </div>
  )
}
