"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { AutomationCard } from "./_components/automation-card";
import { AutomationEmpty } from "./_components/automation-empty";
import { AutomationSkeleton } from "./_components/automation-skeleton";
import { AutomationStatsBar } from "./_components/automation-stats-bar";

type FilterStatus  = "all" | "active" | "paused" | "draft";
type FilterChannel = "all" | "instagram" | "whatsapp";

export default function AutomationsPage() {
  const router = useRouter();

  // ✅ Correct query name from automations.ts
  const automations = useQuery(api.automations.listMyAutomations, {});
  const loading = automations === undefined;

  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState<FilterStatus>("all");
  const [filterChannel, setFilterChannel] = useState<FilterChannel>("all");

  const total  = automations?.length ?? 0;
  const active = automations?.filter((a) => a.status === "active").length ?? 0;
  const paused = automations?.filter((a) => a.status === "paused").length ?? 0;

  const filtered = (automations ?? []).filter((a) => {
    const matchSearch  = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.trigger.keywords?.some((k) => k.toLowerCase().includes(search.toLowerCase()));
    const matchStatus  = filterStatus  === "all" || a.status  === filterStatus;
    const matchChannel = filterChannel === "all" || a.channel === filterChannel;
    return matchSearch && matchStatus && matchChannel;
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 48px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--ink-1)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Automations
          </h1>
          <p style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)" }}>
            {loading ? "Loading…" : `${total} automation${total !== 1 ? "s" : ""} · ${active} active`}
          </p>
        </div>
        <button
          onClick={() => router.push("/automations/new")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, transition: "opacity 0.15s ease", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={14} /> New automation
        </button>
      </div>

      {/* Stats bar */}
      {!loading && total > 0 && (
        <AutomationStatsBar total={total} active={active} paused={paused} />
      )}

      {/* Search + filters */}
      {!loading && total > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={13} color="var(--ink-3)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or keyword…"
              style={{ width: "100%", height: 36, borderRadius: 8, border: "1px solid var(--rule-md)", background: "var(--bg-card)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "0 12px 0 32px", outline: "none", transition: "border-color 0.12s ease" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "active", "paused", "draft"] as FilterStatus[]).map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ height: 36, padding: "0 12px", borderRadius: 8, fontSize: 12, border: "1px solid var(--rule-md)", background: filterStatus === s ? "var(--ink-1)" : "var(--bg-card)", color: filterStatus === s ? "var(--ink-inv)" : "var(--ink-3)", cursor: "pointer", transition: "all 0.12s ease", textTransform: "capitalize" }}>
                {s}
              </button>
            ))}
          </div>

          {/* Channel filter */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "instagram", "whatsapp"] as FilterChannel[]).map((c) => (
              <button key={c} onClick={() => setFilterChannel(c)} style={{ height: 36, padding: "0 12px", borderRadius: 8, fontSize: 12, border: "1px solid var(--rule-md)", background: filterChannel === c ? "var(--ink-1)" : "var(--bg-card)", color: filterChannel === c ? "var(--ink-inv)" : "var(--ink-3)", cursor: "pointer", transition: "all 0.12s ease" }}>
                {c === "all" ? "All channels" : c === "instagram" ? "Instagram" : "WhatsApp"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--rule)", borderRadius: 12, overflow: "hidden" }}>
        {/* List header row */}
        {!loading && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", borderBottom: "1px solid var(--rule)", background: "var(--bg-subtle)" }}>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Automation</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", width: 120, textAlign: "right" }} className="auto-stats">Stats</span>
            <span style={{ width: 80, flexShrink: 0 }} />
          </div>
        )}

        {loading ? (
          <AutomationSkeleton />
        ) : total === 0 ? (
          <AutomationEmpty />
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)", marginBottom: 12 }}>No automations match your filters.</p>
            <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterChannel("all"); }} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((automation) => (
            <AutomationCard key={automation._id} automation={automation} />
          ))
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 12, textAlign: "center" }}>
          Showing {filtered.length} of {total} automation{total !== 1 ? "s" : ""}
        </p>
      )}

      <style>{`
        @media (max-width: 600px) { .auto-stats { display: none !important; } }
      `}</style>
    </div>
  );
}