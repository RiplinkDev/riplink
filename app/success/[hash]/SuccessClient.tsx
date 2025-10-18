"use client"

import { useEffect, useState } from "react"
import Copy from "@/components/Copy"

type TxInfo = {
  Account?: string
  Destination?: string
  Amount?: string
  hash?: string
}
type MintPayload = { uuid: string; openUrl: string; qrUrl: string }

export default function SuccessClient({ hash }: { hash: string }) {
  const [tx, setTx] = useState<TxInfo | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [mint, setMint] = useState<MintPayload | null>(null)
  const [mintStatus, setMintStatus] = useState<"idle" | "awaiting" | "signed" | "expired" | "error">("idle")

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/xrpl/tx/${hash}`)
        const data = await res.json()
        if (data?.error) {
          setErr(data.error)
          return
        }
        setTx({
          Account: data?.Account,
          Destination: data?.Destination,
          Amount: data?.Amount,
          hash: data?.hash || hash,
        })
      } catch (e: any) {
        setErr(e?.message || "lookup failed")
      }
    })()
  }, [hash])

  async function handleMint() {
    if (!tx?.Account) {
      setErr("Sender account not found in TX")
      return
    }
    setMint(null)
    setMintStatus("idle")
    try {
      const res = await fetch("/api/xumm/mint-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash, account: tx.Account }),
      })
      const data = await res.json()
      if (!res.ok || !data?.uuid) {
        setErr(typeof data?.error === "string" ? data.error : "mint create failed")
        setMintStatus("error")
        return
      }
      setErr(null)
      setMint(data)
      setMintStatus("awaiting")
    } catch (e: any) {
      setErr(e?.message || "network error")
      setMintStatus("error")
    }
  }

  // poll the mint payload if present
  useEffect(() => {
    if (!mint?.uuid || mintStatus !== "awaiting") return
    const uuid = mint.uuid
    const tick = async () => {
      try {
        const res = await fetch(`/api/xumm/payload/${uuid}`)
        const data = await res.json()
        if (data?.expired) setMintStatus("expired")
        else if (data?.signed) setMintStatus("signed")
      } catch {}
    }
    const id: any = setInterval(tick, 3000)
    return () => clearInterval(id)
  }, [mint?.uuid, mintStatus])

  const amountXrp = tx?.Amount ? (Number(tx.Amount) / 1_000_000).toString() : "-"

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg glass rounded-2xl p-8 text-center glow-accent">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-rip-teal to-rip-cyan" />
          <div className="relative text-6xl">✨</div>
        </div>

        <h1 className="text-3xl font-extrabold mb-2">
          <span className="gradient-text">Payment Complete!</span>
        </h1>
        <p className="text-muted-foreground mb-6">Your transaction was successful</p>

        <div className="text-left space-y-3 bg-card/50 rounded-xl p-5 border border-border mb-6">
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Transaction</span>
            <span className="text-sm font-mono break-all text-foreground ml-3">{hash}</span>
          </div>
          {tx?.Account && (
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-sm font-mono break-all text-foreground ml-3">{tx.Account}</span>
            </div>
          )}
          {tx?.Destination && (
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-sm font-mono break-all text-foreground ml-3">{tx.Destination}</span>
            </div>
          )}
          {tx?.Amount && (
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-2xl font-bold gradient-text">{amountXrp} XRP</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <a
            href={`https://testnet.xrpl.org/transactions/${hash}`}
            target="_blank"
            className="gradient-button rounded-xl text-white font-bold px-6 py-3 shadow-lg"
            rel="noreferrer"
          >
            View on XRPL
          </a>
          <a
            href={`/receipt/${hash}`}
            className="rounded-xl border-2 border-primary text-primary font-bold px-6 py-3 hover:bg-primary/10 transition-colors"
          >
            View Receipt
          </a>
          <Copy text={typeof window !== "undefined" ? location.href : hash} />
        </div>

        {err && (
          <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive">
            <p className="text-destructive text-sm">{err}</p>
          </div>
        )}

        <div className="text-center border-t border-border pt-6">
          <h2 className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
            <span>🎫</span>
            <span>NFT Receipt</span>
            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Mint a proof-of-payment NFT to the sender&apos;s wallet on XRPL testnet.
          </p>

          {!mint && (
            <button
              onClick={handleMint}
              className="w-full gradient-button rounded-xl text-white font-bold px-6 py-3 shadow-lg"
            >
              Mint Receipt NFT
            </button>
          )}

          {mint && (
            <div className="mt-4 text-center p-4 rounded-xl bg-card border border-border">
              <div className="relative mb-4">
                <div className="absolute inset-0 blur-xl opacity-20 bg-gradient-to-r from-rip-violet to-rip-magenta rounded-xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mint.qrUrl || "/placeholder.svg"}
                  alt="Mint QR"
                  className="relative mx-auto w-48 h-48 rounded-xl bg-white p-3 shadow-lg"
                />
              </div>
              <a
                href={mint.openUrl}
                className="inline-block w-full gradient-button rounded-xl text-white font-bold px-6 py-3 shadow-lg mb-3"
              >
                Open in Xaman
              </a>
              <div className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                <span
                  className={`font-semibold ${
                    mintStatus === "signed"
                      ? "text-success"
                      : mintStatus === "expired" || mintStatus === "error"
                        ? "text-destructive"
                        : "text-warning"
                  }`}
                >
                  {mintStatus}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
