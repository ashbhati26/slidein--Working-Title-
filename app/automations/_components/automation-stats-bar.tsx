interface AutomationStatsBarProps {
  total:  number;
  active: number;
  paused: number;
}

export function AutomationStatsBar({ total, active, paused }: AutomationStatsBarProps) {
  const stats = [
    { label: "Total",  value: total,           color: "var(--ink-1)" },
    { label: "Active", value: active,           color: "var(--green)"  },
    { label: "Paused", value: paused,           color: "var(--yellow)" },
    { label: "Draft",  value: total - active - paused, color: "var(--ink-3)" },
  ];

  return (
    <div style={{
      display: "flex", gap: 0,
      background: "var(--bg-card)",
      border: "1px solid var(--rule)",
      borderRadius: 10, overflow: "hidden",
      marginBottom: 16,
    }}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            flex: 1, padding: "14px 16px",
            borderRight: i < stats.length - 1 ? "1px solid var(--rule)" : "none",
          }}
        >
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 400,
            letterSpacing: "-0.02em", color: s.color, lineHeight: 1, marginBottom: 4,
          }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, fontWeight: 400, color: "var(--ink-3)", letterSpacing: "0.02em" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}