"use client"

type ReceiptNFTProps = {
  amount: string
  memo?: string
  timestamp: string
  txHash: string
}

export default function ReceiptNFT({ amount, memo, timestamp, txHash }: ReceiptNFTProps) {
  const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-6)}`

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
        {/* Gradient background matching mockup */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-300 to-pink-400" />

        {/* Subtle wave pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
            <path d="M0,200 Q100,150 200,200 T400,200 L400,400 L0,400 Z" fill="url(#wave-gradient)" opacity="0.3" />
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">RECEIPT NFT</h1>
          </div>

          {/* Transaction details */}
          <div className="space-y-4">
            {/* Amount */}
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-bold text-gray-900">AMOUNT</span>
              <span className="text-5xl font-black text-gray-900">{amount} XRP</span>
            </div>

            {/* Memo */}
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">MEMO</span>
              <span className="text-2xl font-semibold text-gray-900">{memo || "Display"}</span>
            </div>

            {/* Timestamp */}
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">TIMESTAMP</span>
              <span className="text-xl font-semibold text-gray-900">{timestamp}</span>
            </div>

            {/* TX Hash */}
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">TX HASH</span>
              <span className="text-xl font-mono font-semibold text-gray-900">{shortHash}</span>
            </div>
          </div>

          {/* Footer spacer */}
          <div />
        </div>
      </div>
    </div>
  )
}
