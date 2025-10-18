import Link from "next/link"
import Logo from "@/components/Logo"
import Image from "next/image"

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="text-center py-24">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-rip-blue via-rip-purple to-rip-green" />
            <Logo size={64} />
          </div>
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
          <span className="gradient-text">XRP Payments</span>
          <br />
          <span className="text-foreground">in One Link.</span>
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Create a link. Get paid in XRP. Real-time status. Optional NFT receipts.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/create"
            className="gradient-button rounded-2xl text-white px-8 py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            CREATE PAYMENT LINK
          </Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 pb-24">
        <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
            <Image src="/lightning-bolt.png" alt="Lightning bolt" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rip-navy/60 to-rip-navy/90" />
          <div className="relative z-10">
            <div className="w-12 h-1 mx-auto mb-4 rounded-full bg-gradient-to-r from-rip-blue to-rip-purple" />
            <h3 className="font-bold text-xl mb-3 text-foreground group-hover:gradient-text transition-all text-center uppercase">
              Instant Payments, Near-Zero Fees
            </h3>
            <p className="text-sm leading-relaxed text-center font-medium text-ring">
              Experience lightning-fast XRP transactions in seconds with costs so small they're almost invisible.
              Powered by the XRPL and secured through Xaman (Xumm).
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
            <Image src="/qr-cube.png" alt="QR code cube" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rip-navy/60 to-rip-navy/90" />
          <div className="relative z-10">
            <div className="w-12 h-1 mx-auto mb-4 rounded-full bg-gradient-to-r from-rip-purple to-rip-green" />
            <h3 className="font-bold text-xl mb-3 text-foreground group-hover:gradient-text transition-all text-center uppercase">
              Simple, Shareable, Seamless
            </h3>
            <p className="text-sm leading-relaxed text-center font-medium text-ring">
              Generate a unique payment link in seconds — send it via QR or copy-and-paste. Payers open it directly in
              Xumm for a one-tap checkout experience.
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
            <Image src="/live-tracking.png" alt="Real-time tracking" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rip-navy/60 to-rip-navy/90" />
          <div className="relative z-10">
            <div className="w-12 h-1 mx-auto mb-4 rounded-full bg-gradient-to-r from-rip-green to-rip-yellow" />
            <h3 className="font-bold text-xl mb-3 text-foreground group-hover:gradient-text transition-all text-center uppercase">
              Real-Time Tracking
            </h3>
            <p className="text-sm leading-relaxed text-center font-medium text-ring">
              Watch every transaction update live — from 'awaiting signature' to 'confirmed on-ledger.' Full visibility
              means no more guessing or waiting.
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
            <Image src="/nft-receipt.png" alt="NFT receipt" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rip-navy/60 to-rip-navy/90" />
          <div className="relative z-10">
            <div className="w-12 h-1 mx-auto mb-4 rounded-full bg-gradient-to-r from-rip-yellow to-rip-orange" />
            <h3 className="font-bold text-xl mb-3 text-foreground group-hover:gradient-text transition-all text-center uppercase">
              Proof-of-Payment NFTs
            </h3>
            <p className="text-sm leading-relaxed text-center font-medium text-ring">
              Every payment can mint a collectible NFT receipt, recorded forever on the XRP Ledger — proof, art, and
              utility combined. (Coming Soon)
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
            <Image src="/security-lock.png" alt="Security lock" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rip-navy/60 to-rip-navy/90" />
          <div className="relative z-10">
            <div className="w-12 h-1 mx-auto mb-4 rounded-full bg-gradient-to-r from-rip-orange to-rip-blue" />
            <h3 className="font-bold text-xl mb-3 text-foreground group-hover:gradient-text transition-all text-center uppercase">
              You Stay in Control
            </h3>
            <p className="text-sm leading-relaxed text-center font-medium text-ring">
              Riplink never holds your funds or keys. All payments move wallet-to-wallet via the XRPL — decentralized,
              direct, and secure.
            </p>
          </div>
        </div>
      </section>

      <footer className="text-center text-sm text-muted-foreground pb-12 border-t border-border/50 pt-8">
        <p className="mb-2">© 2025 Riplink, Inc.  Built for the XRPL community.</p>
        <p className="font-semibold gradient-text">Lightning-Fast. Safe. Reliable.</p>
      </footer>
    </div>
  )
}
