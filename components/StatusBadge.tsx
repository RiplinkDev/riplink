export default function StatusBadge({
  state,
}: {
  state: "idle" | "awaiting" | "signed" | "expired" | "error"
}) {
  const map = {
    idle: { txt: "Idle", cls: "bg-muted/50 text-muted-foreground border-muted" },
    awaiting: { txt: "⏳ Awaiting signature", cls: "bg-warning/10 text-warning border-warning/30" },
    signed: { txt: "✓ Signed & submitted", cls: "bg-success/10 text-success border-success/30" },
    expired: { txt: "⏰ Expired", cls: "bg-destructive/10 text-destructive border-destructive/30" },
    error: { txt: "✗ Error", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  } as const
  const m = map[state]
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${m.cls}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {m.txt}
    </span>
  )
}
