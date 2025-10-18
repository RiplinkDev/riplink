import { Suspense } from "react"
import ReceiptClient from "./ReceiptClient"

export default function ReceiptPage({ params }: { params: Promise<{ hash: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReceiptClient params={params} />
    </Suspense>
  )
}
