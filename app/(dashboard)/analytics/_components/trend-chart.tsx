"use client";

interface TrendPoint { label: string; count: number; }

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{
      background: "var(--bg)", border: "0.5px solid var(--rule-md)",
      borderRadius: 14, padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
          Leads — last 7 days
        </p>
        <p style={{ fontSize: 11, color: "var(--ink-3)" }}>
          {data.reduce((s, d) => s + d.count, 0)} total
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 88 }}>
        {data.map((d, i) => {
          const pct    = (d.count / max) * 100;
          const height = Math.max(pct, d.count > 0 ? 8 : 3);
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
              {d.count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--accent)", letterSpacing: "-0.01em" }}>
                  {d.count}
                </span>
              )}
              <div style={{
                width: "100%", height: `${height}%`, minHeight: 3,
                borderRadius: "3px 3px 2px 2px",
                background: d.count > 0 ? "var(--accent)" : "var(--rule)",
                transition: "height 0.4s ease",
                opacity: d.count > 0 ? 1 : 0.5,
              }} />
              <span style={{ fontSize: 9, color: "var(--ink-3)", whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}