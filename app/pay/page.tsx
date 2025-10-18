import { Suspense } from "react"
import PayClient from "./PayClient"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading…</div>
      }
    >
      <PayClient />
    </Suspense>
  )
}
