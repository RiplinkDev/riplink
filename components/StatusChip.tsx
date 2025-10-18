export default function StatusChip({ state }: { state: "awaiting" | "opened" | "signed" | "expired" | "error" }) {
  const map: Record<"awaiting" | "opened" | "signed" | "expired" | "error", { label: string; color: string }> = {
    awaiting: { label: "Awaiting signature…", color: "bg-warning" },
    opened: { label: "Opened in wallet", color: "bg-primary" },
    signed: { label: "Signed & submitted", color: "bg-success" },
    expired: { label: "Expired", color: "bg-destructive" },
    error: { label: "Error", color: "bg-destructive" },
  }
  const v = map[state] ?? map.awaiting
  return (
    <span className={`inline-flex items-center gap-2 text-[11px] px-2 py-1 rounded-full ${v.color}`}>
      <span className="inline-block w-2 h-2 rounded-full bg-white" />
      {v.label}
    </span>
  )
}
