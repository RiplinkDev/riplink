"use client"

import { useEffect, useState } from "react"
import LiveTxTracker from "@/components/LiveTxTracker"
import Link from "next/link"

export const dynamic = "force-dynamic"

type SavedLink = {
  amount?: number | string
  memo?: string
  to?: string
  url?: string
  txHash?: string
  createdAt?: string
}

export default function DashboardPage() {
  const [links, setLinks] = useState<SavedLink[]>([])

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("riplink_links")
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) setLinks(arr)
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold mb-3">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">View and manage your payment links</p>
        </div>

        {links.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">💸</div>
            <h2 className="text-xl font-bold mb-2">No payment links yet</h2>
            <p className="text-muted-foreground mb-6">Create your first payment link to get started</p>
            <Link
              href="/create"
              className="gradient-button inline-block rounded-xl text-white font-bold px-6 py-3 shadow-lg"
            >
              Create Payment Link
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((l, idx) => (
              <div key={idx} className="glass rounded-2xl p-6 hover:glow-primary transition-all text-center">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground mb-1">{l.amount ?? "-"} XRP</div>
                    {l.memo && <div className="text-sm text-muted-foreground">{l.memo}</div>}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">Active</div>
                </div>

                {l.to && (
                  <div className="mb-3 p-3 rounded-xl bg-card border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Destination</p>
                    <p className="text-sm font-mono break-all text-foreground">{l.to}</p>
                  </div>
                )}

                {l.txHash && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <LiveTxTracker hash={l.txHash} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
