"use client";

import { Camera, Phone } from "lucide-react";

export function ChannelSplit({ igLeads, waLeads, total }: { igLeads: number; waLeads: number; total: number }) {
  const igPct = total > 0 ? Math.round((igLeads / total) * 100) : 0;
  const waPct = total > 0 ? Math.round((waLeads / total) * 100) : 0;

  return (
    <div style={{
      background: "var(--bg)", border: "0.5px solid var(--rule-md)",
      borderRadius: 14, padding: "18px 20px",
    }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em", marginBottom: 20 }}>
        Channel split
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { label: "Instagram", icon: Camera, color: "#E1306C", count: igLeads, pct: igPct },
          { label: "WhatsApp",  icon: Phone,  color: "#25D366", count: waLeads, pct: waPct },
        ].map(({ label, icon: Icon, color, count, pct }) => (
          <div key={label}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon size={12} color={color} />
                <span style={{ fontSize: 12, color: "var(--ink-2)", letterSpacing: "-0.005em" }}>{label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{pct}%</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>{count}</span>
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "var(--rule)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: color, transition: "width 0.4s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Keyword { keyword: string; count: number; }

export function TopKeywords({ keywords }: { keywords: Keyword[] }) {
  const max = Math.max(...keywords.map((k) => k.count), 1);
  return (
    <div style={{
      background: "var(--bg)", border: "0.5px solid var(--rule-md)",
      borderRadius: 14, padding: "18px 20px",
    }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em", marginBottom: 16 }}>
        Top keywords
      </p>
      {keywords.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic" }}>
          No leads yet — keywords will appear once automations fire.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {keywords.map(({ keyword, count }) => (
            <div key={keyword}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-1)", fontFamily: "monospace", letterSpacing: "0.04em" }}>
                  {keyword}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{count} lead{count !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: "var(--rule)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${Math.round((count / max) * 100)}%`, background: "var(--accent)", transition: "width 0.4s ease" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}