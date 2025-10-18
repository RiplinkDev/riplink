import { Settings, Briefcase, Globe } from "lucide-react"

export default function RoadmapPage() {
  const phases = [
    {
      title: "Foundation",
      timeline: "M 1-3",
      icon: Settings,
      /* Updated gradients to match new logo: blue → purple → green */
      gradient: "from-rip-blue via-rip-purple to-rip-green",
      borderGradient: "from-rip-blue to-rip-purple",
      features: ["Payment Link Generator", "QR Code Integration", "Live Status Polling", "Basic NFT Receipt"],
    },
    {
      title: "Business Tools",
      timeline: "M 4-6",
      icon: Briefcase,
      gradient: "from-rip-purple via-rip-green to-rip-yellow",
      borderGradient: "from-rip-purple to-rip-green",
      features: ["Custom Profiles", "Invoice Mode", "Analytics Dashboard", "NFT Receipts v2"],
    },
    {
      title: "Ecosystem Expansion",
      timeline: "M 7-9",
      icon: Globe,
      gradient: "from-rip-green via-rip-yellow to-rip-orange",
      borderGradient: "from-rip-yellow to-rip-orange",
      features: ["Multi-Token Support", "DEX Swap Widget", "Fiat On/Off Ramp", "Affiliate System"],
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">
          <span className="text-foreground">Riplink</span>
        </h1>
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          <span className="gradient-text">12-Month Build & Growth Plan</span>
        </h2>
      </div>

      <div className="space-y-8">
        {phases.map((phase, index) => {
          const Icon = phase.icon
          return (
            <div key={phase.title} className="relative group">
              {/* Gradient border effect */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${phase.borderGradient} rounded-3xl opacity-75 group-hover:opacity-100 transition-opacity blur-sm`}
              />

              {/* Card content */}
              <div className="relative glass rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {/* Icon with gradient background */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${phase.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl mb-1 font-extrabold text-accent">{phase.title}</h3>
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold bg-gradient-to-r ${phase.borderGradient} bg-clip-text text-transparent`}
                  >
                    {phase.timeline}
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-3 ml-20">
                  {phase.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-lg">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${phase.borderGradient}`} />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground text-lg mb-4">
          Building the future of XRP payments — at lightning speed.
        </p>
        <p className="font-semibold gradient-text text-xl">Lightning-Fast. Safe. Reliable.</p>
      </div>
    </div>
  )
}
