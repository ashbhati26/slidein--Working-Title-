interface AutomationStatsBarProps { total: number; active: number; paused: number; }

export function AutomationStatsBar({ total, active, paused }: AutomationStatsBarProps) {
  const items = [
    { label: "Total",  value: total,                  color: "var(--ink-1)"  },
    { label: "Active", value: active,                 color: "var(--green)"  },
    { label: "Paused", value: paused,                 color: "var(--yellow)" },
    { label: "Draft",  value: total - active - paused, color: "var(--ink-3)" },
  ];
  return (
    <div style={{ display: "flex", background: "var(--bg)", border: "0.5px solid var(--rule-md)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
      {items.map((s, i) => (
        <div key={s.label} style={{ flex: 1, padding: "12px 16px", borderRight: i < items.length - 1 ? "0.5px solid var(--rule)" : "none" }}>
          <p style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.04em", color: s.color, lineHeight: 1, marginBottom: 3, fontFamily: "var(--font-sans)" }}>
            {s.value}
          </p>
          <p style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}