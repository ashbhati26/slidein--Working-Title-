"use client";

interface StatusCounts {
  new: number; in_conversation: number; qualified: number;
  converted: number; lost: number; opted_out: number;
}

const STATUS_CONFIG = [
  { key: "new"             as keyof StatusCounts, label: "New",             color: "var(--accent)"  },
  { key: "in_conversation" as keyof StatusCounts, label: "In conversation", color: "#a78bfa"        },
  { key: "qualified"       as keyof StatusCounts, label: "Qualified",       color: "var(--green)"   },
  { key: "converted"       as keyof StatusCounts, label: "Converted",       color: "#22c55e"        },
  { key: "lost"            as keyof StatusCounts, label: "Lost",            color: "var(--red)"     },
  { key: "opted_out"       as keyof StatusCounts, label: "Opted out",       color: "var(--ink-3)"   },
];

export function StatusChart({ counts, total }: { counts: StatusCounts; total: number }) {
  return (
    <div style={{
      background: "var(--bg)", border: "0.5px solid var(--rule-md)",
      borderRadius: 14, padding: "18px 20px",
    }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em", marginBottom: 16 }}>
        Lead status
      </p>

      {/* Stacked bar */}
      <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", marginBottom: 18, gap: 2 }}>
        {total === 0
          ? <div style={{ flex: 1, background: "var(--rule)", borderRadius: 99 }} />
          : STATUS_CONFIG.map(({ key, color }) => {
              const pct = (counts[key] / total) * 100;
              if (pct === 0) return null;
              return <div key={key} style={{ width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s ease" }} />;
            })
        }
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {STATUS_CONFIG.map(({ key, label, color }) => {
          const count = counts[key];
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--ink-2)", letterSpacing: "-0.005em" }}>{label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{pct}%</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: count > 0 ? "var(--ink-1)" : "var(--ink-3)", minWidth: 20, textAlign: "right", letterSpacing: "-0.02em" }}>
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}