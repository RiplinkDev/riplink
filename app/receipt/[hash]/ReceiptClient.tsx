"use client"

import { useEffect, useState } from "react"
import ReceiptNFT from "@/components/ReceiptNFT"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

type TxData = {
  amountXrp?: number
  memo?: string
  timestamp?: string
  hash: string
}

export default function ReceiptClient({ params }: { params: Promise<{ hash: string }> }) {
  const [hash, setHash] = useState<string>("")
  const [txData, setTxData] = useState<TxData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const p = await params
      setHash(p.hash)
    })()
  }, [params])

  useEffect(() => {
    if (!hash) return

    async function fetchTx() {
      try {
        const res = await fetch(`/api/xrpl/tx/${hash}`)
        const data = await res.json()

        if (!data?.ok || !data?.found) {
          setError("Transaction not found")
          setLoading(false)
          return
        }

        // Format timestamp
        const date = data.date ? new Date(data.date) : new Date()
        const formattedDate = date.toISOString().slice(0, 16).replace("T", " ")

        setTxData({
          amountXrp: data.amountXrp || 0,
          memo: data.memo || undefined,
          timestamp: formattedDate,
          hash: data.hash || hash,
        })
        setLoading(false)
      } catch (e: any) {
        setError(e?.message || "Failed to load transaction")
        setLoading(false)
      }
    }

    fetchTx()
  }, [hash])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !txData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3 text-destructive">Error</h1>
          <p className="text-muted-foreground">{error || "Transaction data not available"}</p>
          <Link href="/" className="inline-block mt-6 gradient-button px-6 py-3 rounded-xl text-white font-bold">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <Link
          href={`/success/${hash}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transaction
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="gradient-text">NFT Receipt</span>
          </h1>
          <p className="text-muted-foreground">Proof of payment on XRPL</p>
        </div>

        <ReceiptNFT
          amount={txData.amountXrp?.toFixed(2) || "0.00"}
          memo={txData.memo}
          timestamp={txData.timestamp || ""}
          txHash={txData.hash}
        />

        <div className="mt-8 text-center">
          <a
            href={`https://testnet.xrpl.org/transactions/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block gradient-button px-8 py-4 rounded-xl text-white font-bold shadow-lg"
          >
            View on XRPL Explorer
          </a>
        </div>
      </div>
    </div>
  )
}
