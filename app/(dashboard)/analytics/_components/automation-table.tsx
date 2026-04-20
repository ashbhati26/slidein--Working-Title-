"use client";

import { Camera, Phone } from "lucide-react";

interface AutomationRow {
  id: string; name: string; channel: "instagram" | "whatsapp";
  status: string; triggers: number; leads: number; replies: number; lastFired: number | null;
}

function timeAgo(ts: number | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function AutomationTable({ rows }: { rows: AutomationRow[] }) {
  return (
    <div style={{ background: "var(--bg)", border: "0.5px solid var(--rule-md)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--rule)" }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
          Automation performance
        </p>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: "32px 18px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No automations yet.</p>
        </div>
      ) : (
        <>
          {/* Head */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 64px 64px 64px 90px",
            padding: "7px 18px", background: "var(--bg-subtle)", borderBottom: "0.5px solid var(--rule)",
          }}>
            {["Automation", "Triggers", "Leads", "Replies", "Last fired"].map((h) => (
              <span key={h} style={{
                fontSize: 10, fontWeight: 600, color: "var(--ink-3)",
                letterSpacing: "0.05em", textTransform: "uppercase",
                textAlign: h === "Automation" ? "left" : "right",
              }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={row.id} style={{
              display: "grid", gridTemplateColumns: "1fr 64px 64px 64px 90px",
              padding: "11px 18px", alignItems: "center",
              borderBottom: i < rows.length - 1 ? "0.5px solid var(--rule)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: row.channel === "instagram" ? "rgba(225,48,108,0.08)" : "rgba(37,211,102,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {row.channel === "instagram"
                    ? <Camera size={10} color="#E1306C" />
                    : <Phone  size={10} color="#25D366" />
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.name}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "capitalize" }}>{row.status}</p>
                </div>
              </div>
              {[row.triggers, row.leads, row.replies].map((val, j) => (
                <p key={j} style={{ fontSize: 13, fontWeight: 600, color: val > 0 ? "var(--ink-1)" : "var(--ink-3)", textAlign: "right", letterSpacing: "-0.02em" }}>
                  {val}
                </p>
              ))}
              <p style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "right" }}>{timeAgo(row.lastFired)}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}