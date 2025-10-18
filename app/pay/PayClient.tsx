"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"

type CreateRes =
  | { uuid: string; openUrl: string; qrUrl: string; deeplink: string; ws?: string | null }
  | { error: string; message: string; instructions?: string[] }

type SavedPayment = {
  uuid: string
  amount: string
  memo?: string
  to: string
  createdAt: number
}

export default function PayClient() {
  const sp = useSearchParams()
  const router = useRouter()

  const amount = sp.get("amount") || ""
  const memo = sp.get("memo") || ""
  const to = sp.get("to") || ""

  const [payload, setPayload] = useState<{
    uuid: string
    openUrl: string
    qrUrl: string
    deeplink: string
    ws?: string | null
  } | null>(null)

  const [status, setStatus] = useState<"idle" | "awaiting" | "opened" | "signed" | "expired" | "error">("idle")
  const [err, setErr] = useState<string | null>(null)

  // Create payment link
  useEffect(() => {
    async function init() {
      if (!amount || !to) return
      try {
        const res = await fetch("/api/xumm/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: to,
            amountXrp: Number(amount),
            memo,
          }),
        })
        const data = (await res.json()) as CreateRes
        if ("error" in data) {
          setStatus("error")
          if (data.instructions) {
            const instructionText = data.instructions.join("\n")
            setErr(`${data.message}\n\n${instructionText}`)
          } else {
            setErr(data.error)
          }
          return
        }
        console.log("[v0] Payment link created:", data)
        setPayload(data)
        setStatus("awaiting")

        // SAVE to localStorage for Dashboard
        try {
          const row: SavedPayment = {
            uuid: data.uuid,
            amount,
            memo: memo || undefined,
            to,
            createdAt: Date.now(),
          }
          const old = JSON.parse(localStorage.getItem("riplink_payments") || "[]") as SavedPayment[]
          localStorage.setItem("riplink_payments", JSON.stringify([row, ...old].slice(0, 100)))
        } catch {}
      } catch (e: any) {
        setStatus("error")
        setErr(e?.message || "Network error")
      }
    }
    init()
  }, [amount, memo, to])

  if (!amount || !to) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3 gradient-text">Missing Payment Details</h1>
          <p className="text-muted-foreground">
            Provide <code className="text-primary">?amount=</code> and <code className="text-primary">?to=</code> in the
            URL.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg glass rounded-2xl p-8 text-center glow-primary">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">{amount} XRP</span>
        </h1>
        {memo && (
          <div className="mb-4 p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-sm text-muted-foreground">Memo</p>
            <p className="text-foreground font-medium">{memo}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground break-all mb-6 font-mono text-center">To: {to}</p>

        {err && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive">
            <p className="destructive text-sm">{err}</p>
          </div>
        )}

        {!payload && (
          <div className="py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Preparing payment request…</p>
          </div>
        )}

        {payload && (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-xl opacity-20 bg-gradient-to-r from-rip-cyan to-rip-violet rounded-2xl" />
              <Image
                src={payload.qrUrl || "/placeholder.svg"}
                alt="Xaman QR Code"
                width={256}
                height={256}
                className="relative mx-auto w-64 h-64 rounded-2xl bg-white p-4 shadow-xl object-contain"
                onError={(e) => {
                  console.log("[v0] QR code failed to load:", payload.qrUrl)
                }}
                crossOrigin="anonymous"
              />
            </div>

            <a
              href={payload.openUrl}
              className="gradient-button inline-block w-full px-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg mb-4"
            >
              Open in Xaman
            </a>

            <div className="flex flex-col gap-2 text-sm mb-6">
              <p className="text-muted-foreground text-xs">
                Scan the QR code with Xaman wallet or click the button above
              </p>
            </div>

            {status !== "idle" && (
              <div className="mt-6 p-4 rounded-xl bg-card border border-border">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="font-semibold text-warning">⏳ Awaiting signature...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
