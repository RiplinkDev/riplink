"use client"
import { useEffect, useState } from "react"
import type React from "react"

import Copy from "@/components/Copy"

type SavedLink = { url: string; amount: string; memo?: string; to: string; ts: number }

export default function CreatePage() {
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [address, setAddress] = useState("")
  const [link, setLink] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = `/pay?amount=${amount}&memo=${encodeURIComponent(memo)}&to=${address.trim()}`
    setLink(url)

    try {
      const row: SavedLink = { url, amount, memo, to: address.trim(), ts: Date.now() }
      const old = JSON.parse(localStorage.getItem("riplink_links") || "[]") as SavedLink[]
      localStorage.setItem("riplink_links", JSON.stringify([row, ...old].slice(0, 20)))
    } catch {}
  }

  useEffect(() => {
    const last = localStorage.getItem("riplink_last_to")
    if (last) setAddress(last)
  }, [])

  useEffect(() => {
    if (address) localStorage.setItem("riplink_last_to", address)
  }, [address])

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-3">
          <span className="gradient-text">Create Payment Link</span>
        </h1>
        <p className="text-muted-foreground">Generate a shareable XRP payment link in seconds</p>
      </div>

      <div className="glass rounded-2xl p-8 glow-primary">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 text-left font-sans">Amount (XRP)</label>
            <input
              type="number"
              min={0}
              step="0.001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 rounded-xl border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-sidebar-foreground font-medium font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 text-left font-sans">Memo (optional)</label>
            <input
              type="text"
              placeholder="Payment for..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-4 rounded-xl border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-foreground text-sidebar-foreground font-medium font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 text-left font-sans">Destination Address</label>
            <input
              type="text"
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-4 rounded-xl border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm bg-foreground text-sidebar-foreground font-sans font-medium"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="gradient-button flex-1 rounded-xl text-white px-6 py-4 shadow-lg font-semibold text-xl"
            >
              GENERATE LINK 
            </button>
            {link && <Copy text={`${location.origin}${link}`} />}
          </div>
        </form>

        {link && (
          <div className="mt-8 p-4 rounded-xl bg-card border border-border">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Your payment link:</p>
            <a
              href={link}
              className="text-primary break-all hover:text-accent transition-colors font-mono text-sm block"
            >
              {`${location.origin}${link}`}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
