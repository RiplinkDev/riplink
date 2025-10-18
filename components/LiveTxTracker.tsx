"use client"
import { useEffect, useRef, useState } from "react"

type TxStatus =
  | { state: "idle" }
  | { state: "searching" }
  | { state: "pending" }
  | { state: "confirmed"; ledger: number | null }
  | { state: "notfound" }
  | { state: "error"; msg: string }

export default function LiveTxTracker({ hash }: { hash: string }) {
  const [status, setStatus] = useState<TxStatus>({ state: "searching" })
  const [meta, setMeta] = useState<{ amount?: number | null; memo?: string; dest?: string } | null>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!hash) return

    async function tick() {
      try {
        const res = await fetch(`/api/xrpl/tx/${hash}`, { cache: "no-store" })
        const data = await res.json()

        if (!data?.ok) {
          setStatus({ state: "error", msg: data?.error ?? "Unknown error" })
          return
        }

        if (data.found === false) {
          setStatus({ state: "pending" })
          return
        }

        // found
        setMeta({ amount: data.amountXrp, memo: data.memo, dest: data.destination })
        if (data.validated) {
          setStatus({ state: "confirmed", ledger: data.ledger_index ?? null })
          if (timer.current) {
            clearInterval(timer.current)
            timer.current = null
          }
        } else {
          setStatus({ state: "pending" })
        }
      } catch (e: any) {
        setStatus({ state: "error", msg: e?.message ?? "Network error" })
      }
    }

    // poll every 3s
    tick()
    timer.current = setInterval(tick, 3000)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [hash])

  const badge = (() => {
    switch (status.state) {
      case "searching":
      case "pending":
        return <span className="px-2 py-1 rounded-md bg-warning/10 text-warning text-xs">Awaiting confirmation…</span>
      case "confirmed":
        return <span className="px-2 py-1 rounded-md bg-success/10 text-success text-xs">Confirmed ✅</span>
      case "notfound":
        return <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs">Not found</span>
      case "error":
        return <span className="px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs">Error</span>
      default:
        return null
    }
  })()

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold">Transaction Status</div>
        {badge}
      </div>

      <div className="mt-2 break-all text-card-foreground/80">
        <div>
          <span className="text-muted-foreground">Hash:</span>{" "}
          <a
            className="underline text-primary"
            href={`https://testnet.xrpl.org/transactions/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            {hash}
          </a>
        </div>
        {meta?.amount != null && (
          <div>
            <span className="text-muted-foreground">Amount:</span> {meta.amount} XRP
          </div>
        )}
        {meta?.dest && (
          <div>
            <span className="text-muted-foreground">To:</span> {meta.dest}
          </div>
        )}
        {meta?.memo && (
          <div className="truncate">
            <span className="text-muted-foreground">Memo:</span> {meta.memo}
          </div>
        )}
        {status.state === "confirmed" && (
          <div className="mt-2 text-muted-foreground">
            Included in ledger <span className="font-mono">{status.ledger ?? "?"}</span>
          </div>
        )}
        {status.state === "error" && <div className="mt-2 text-destructive">Error: {status.msg}</div>}
      </div>
    </div>
  )
}
