"use client"
import { useState } from "react"

export default function Copy({ text, small = false }: { text: string; small?: boolean }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setOk(true)
        setTimeout(() => setOk(false), 1200)
      }}
      className={`rounded-xl ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"} border border-border bg-card hover:bg-accent/10 font-semibold transition-all hover:scale-105`}
      title="Copy to clipboard"
    >
      {ok ? "✓ Copied!" : "Copy"}
    </button>
  )
}
