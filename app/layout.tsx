import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Riplink — XRP Payment Links",
  description: "Create, share, and track XRP payment links with Xaman and XRPL.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-rip-navy via-background to-rip-navy" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(58,160,255,0.15),transparent_50%)]" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.15),transparent_50%)]" />
        <Nav />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
