// PAGE: /automations — Automations list
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { AutomationCard }     from "./_components/automation-card";
import { AutomationEmpty }    from "./_components/automation-empty";
import { AutomationSkeleton } from "./_components/automation-skeleton";
import { AutomationStatsBar } from "./_components/automation-stats-bar";

type FilterStatus  = "all" | "active" | "paused" | "draft";
type FilterChannel = "all" | "instagram" | "whatsapp";

// Sort order: active → paused → draft, then by createdAt desc within each group
const STATUS_ORDER: Record<string, number> = { active: 0, paused: 1, draft: 2 };

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      height: 28, padding: "0 11px", borderRadius: 99, fontSize: 11,
      border: "0.5px solid var(--rule-md)",
      background: active ? "var(--ink-1)" : "transparent",
      color:      active ? "var(--ink-inv)" : "var(--ink-3)",
      cursor: "pointer", transition: "all 0.1s ease",
      letterSpacing: "-0.005em", whiteSpace: "nowrap",
    }}>
      {children}
    </button>
  );
}

export default function AutomationsPage() {
  const router      = useRouter();
  const automations = useQuery(api.automations.listMyAutomations, {});
  const loading     = automations === undefined;

  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState<FilterStatus>("all");
  const [filterChannel, setFilterChannel] = useState<FilterChannel>("all");

  const total  = automations?.length ?? 0;
  const active = automations?.filter((a) => a.status === "active").length ?? 0;
  const paused = automations?.filter((a) => a.status === "paused").length ?? 0;

  const filtered = (automations ?? [])
    .filter((a) => {
      const q = search.toLowerCase();
      const matchSearch  = !search || a.name.toLowerCase().includes(q) || a.trigger.keywords?.some((k) => k.toLowerCase().includes(q));
      const matchStatus  = filterStatus  === "all" || a.status  === filterStatus;
      const matchChannel = filterChannel === "all" || a.channel === filterChannel;
      return matchSearch && matchStatus && matchChannel;
    })
    // ── Fix: always show active automations first ──
    .sort((a, b) => {
      const statusDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (statusDiff !== 0) return statusDiff;
      return b.createdAt - a.createdAt; // newest first within same status
    });

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 28px 64px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 4 }}>
            Automations
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-3)", letterSpacing: "-0.01em" }}>
            {loading ? "Loading…" : `${total} automation${total !== 1 ? "s" : ""} · ${active} active`}
          </p>
        </div>
        <button
          onClick={() => router.push("/automations/new")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px", borderRadius: 980, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, letterSpacing: "-0.01em", flexShrink: 0, transition: "opacity 0.15s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={14} strokeWidth={2} /> New automation
        </button>
      </div>

      {/* Stats bar */}
      {!loading && total > 0 && <AutomationStatsBar total={total} active={active} paused={paused} />}

      {/* Search + filters */}
      {!loading && total > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <Search size={11} color="var(--ink-3)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or keyword…"
              style={{ width: "100%", height: 30, borderRadius: 8, border: "0.5px solid var(--rule-md)", background: "var(--bg-subtle)", color: "var(--ink-1)", fontSize: 12, fontFamily: "var(--font-sans)", padding: "0 10px 0 28px", outline: "none", transition: "border-color 0.12s ease", boxSizing: "border-box" as const }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "active", "paused", "draft"] as FilterStatus[]).map((s) => (
              <Pill key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Pill>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "instagram", "whatsapp"] as FilterChannel[]).map((c) => (
              <Pill key={c} active={filterChannel === c} onClick={() => setFilterChannel(c)}>
                {c === "all" ? "All channels" : c === "instagram" ? "Instagram" : "WhatsApp"}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ background: "var(--bg)", border: "0.5px solid var(--rule-md)", borderRadius: 14 }}>
        {!loading && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderBottom: "0.5px solid var(--rule)", background: "var(--bg-subtle)", borderRadius: "14px 14px 0 0" }}>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "var(--ink-3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Automation</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-3)", letterSpacing: "0.05em", textTransform: "uppercase", width: 100, textAlign: "right" }} className="auto-stats">Stats</span>
            <span style={{ width: 72, flexShrink: 0 }} />
          </div>
        )}
        {loading ? <AutomationSkeleton /> :
         total   === 0 ? <AutomationEmpty /> :
         filtered.length === 0 ? (
           <div style={{ padding: "40px 24px", textAlign: "center" }}>
             <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 10 }}>No automations match your filters.</p>
             <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterChannel("all"); }} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
               Clear filters
             </button>
           </div>
         ) : filtered.map((a, i) => <AutomationCard key={a._id} automation={a} isLast={i === filtered.length - 1} />)
        }
      </div>

      {!loading && filtered.length > 0 && total > filtered.length && (
        <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 10, textAlign: "center" }}>
          Showing {filtered.length} of {total}
        </p>
      )}

      <style>{`@media(max-width:600px){.auto-stats{display:none!important}}`}</style>
    </div>
  );
}