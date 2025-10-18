"use client"

import { useEffect, useRef, useState } from "react"

type Status = "awaiting" | "opened" | "signed" | "expired" | "error"

export default function TrackPage({ params }: { params: Promise<{ uuid: string }> }) {
  const [uuid, setUuid] = useState<string>("")
  const [status, setStatus] = useState<Status>("awaiting")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // resolve Route Segment params (Next 15)
  useEffect(() => {
    ;(async () => {
      const p = await params
      setUuid(p.uuid)
    })()
  }, [params])

  // simple polling (2s)
  useEffect(() => {
    if (!uuid) return

    async function tick() {
      try {
        const res = await fetch(`/api/xumm/payload/${uuid}`)
        const data = await res.json()
        if (data?.error) {
          setErr(data.error)
          setStatus("error")
          return
        }
        if (data?.expired) {
          setStatus("expired")
          stop()
          return
        }
        if (data?.signed) {
          setStatus("signed")
          setTxHash(data?.txHash ?? null)
          stop()
          return
        }
        setStatus("awaiting")
      } catch (e: any) {
        setErr(e?.message || "Network error")
        setStatus("error")
      }
    }

    function start() {
      if (pollRef.current) return
      pollRef.current = setInterval(tick, 2000)
      tick() // immediate first check
    }
    function stop() {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }

    start()
    return stop
  }, [uuid])

  const label =
    status === "awaiting"
      ? "Awaiting signature…"
      : status === "opened"
        ? "Opened in wallet"
        : status === "signed"
          ? "Signed & submitted"
          : status === "expired"
            ? "Expired"
            : "Error"

  const color =
    status === "awaiting"
      ? "bg-warning"
      : status === "opened"
        ? "bg-primary"
        : status === "signed"
          ? "bg-success"
          : status === "expired"
            ? "bg-destructive"
            : "bg-destructive"

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 text-center">
        <div className="mb-3">
          <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full ${color}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-white" />
            {label}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-2">Payment Status</h1>
        <p className="text-muted-foreground text-sm mb-4 break-all">Payload UUID: {uuid || "…"}</p>

        {err && <p className="text-destructive text-sm mb-3">{err}</p>}

        {status === "awaiting" && <p className="text-muted-foreground">Waiting for the payer to approve in Xumm…</p>}
        {status === "opened" && <p className="text-muted-foreground">Opened in wallet…</p>}
        {status === "expired" && <p className="text-muted-foreground">The request expired.</p>}

        {status === "signed" && (
          <div className="mt-2">
            <p className="text-card-foreground/80 mb-2">Signed & submitted ✅</p>
            {txHash ? (
              <a
                className="underline text-primary"
                href={`https://testnet.xrpl.org/transactions/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View TX on XRPL
              </a>
            ) : (
              <p className="text-muted-foreground text-sm">Waiting for TX hash…</p>
            )}
            <div className="mt-5 flex justify-center gap-3">
              <a href="/create" className="rounded-xl bg-primary text-primary-foreground font-semibold px-5 py-3">
                Create another link
              </a>
              <a href="/dashboard" className="rounded-xl border border-border px-5 py-3 text-muted-foreground">
                Go to Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
