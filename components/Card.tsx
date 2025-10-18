import type React from "react"
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-border rounded-2xl shadow-xl text-center font-sans bg-primary text-background mx-52 my-7 px-24 py-10 ${className}`}>{children}</div>
}
