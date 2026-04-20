interface StatusDotProps {
  status:     "active" | "paused" | "draft";
  showLabel?: boolean;
}

const CONFIG = {
  active: { color: "var(--green)",  bg: "var(--green-muted)",  border: "var(--green-border)",  label: "Active" },
  paused: { color: "var(--yellow)", bg: "var(--yellow-muted)", border: "var(--yellow-border)", label: "Paused" },
  draft:  { color: "var(--ink-3)",  bg: "var(--rule)",         border: "var(--rule-md)",        label: "Draft"  },
} as const;

export function StatusDot({ status, showLabel = false }: StatusDotProps) {
  const c = CONFIG[status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: c.color, display: "inline-block", flexShrink: 0,
        boxShadow: status === "active" ? `0 0 0 2px ${c.bg}` : "none",
      }} />
      {showLabel && (
        <span style={{ fontSize: 10, fontWeight: 600, color: c.color, background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: 99, padding: "2px 7px" }}>
          {c.label}
        </span>
      )}
    </div>
  );
}