"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, SlidersHorizontal, MessageSquare } from "lucide-react";
import { LeadRow }               from "./_components/lead-row";
import { LeadListSkeleton }      from "./_components/lead-list-skeleton";
import { LeadEmpty }             from "./_components/lead-empty";
import { LeadConversationPanel } from "./_components/lead-conversation-panel";

type FilterStatus  = "all" | "new" | "in_conversation" | "qualified" | "converted" | "opted_out" | "lost";
type FilterChannel = "all" | "instagram" | "whatsapp";

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all",             label: "All"          },
  { value: "new",             label: "New"          },
  { value: "in_conversation", label: "Talking"      },
  { value: "qualified",       label: "Qualified"    },
  { value: "converted",       label: "Converted"    },
  { value: "lost",            label: "Lost"         },
];

/* ── Filter pill ──────────────────────────────────────────── */
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 22, padding: "0 9px", borderRadius: 99, fontSize: 11,
        border: "0.5px solid var(--rule-md)",
        background: active ? "var(--ink-1)" : "transparent",
        color:      active ? "var(--ink-inv)" : "var(--ink-3)",
        cursor: "pointer", transition: "all 0.1s ease",
        letterSpacing: "-0.01em", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export default function LeadsPage() {
  const [selectedLeadId, setSelectedLeadId] = useState<Id<"leads"> | null>(null);
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState<FilterStatus>("all");
  const [filterChannel,  setFilterChannel]  = useState<FilterChannel>("all");
  const [showFilters,    setShowFilters]    = useState(false);
  const [mobileView,     setMobileView]     = useState<"list" | "conversation">("list");

  const leads = useQuery(api.leads.listLeads, {
    status:  filterStatus  !== "all" ? filterStatus  as any : undefined,
    channel: filterChannel !== "all" ? filterChannel as any : undefined,
    limit:   100,
  });

  const loading = leads === undefined;

  const filtered = (leads ?? []).filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.senderUsername?.toLowerCase().includes(q) ||
      l.senderId.toLowerCase().includes(q) ||
      l.triggerKeyword.toLowerCase().includes(q)
    );
  });

  const total    = leads?.length ?? 0;
  const newCount = leads?.filter((l) => l.status === "new").length ?? 0;

  function handleSelectLead(id: Id<"leads">) {
    setSelectedLeadId(id);
    setMobileView("conversation");
  }

  function handleCloseConversation() {
    setMobileView("list");
    setSelectedLeadId(null);
  }

  /* ── Left panel (shared between desktop + mobile list) ── */
  function ListPanel({ mobile = false }: { mobile?: boolean }) {
    return (
      <div style={{
        width: mobile ? "100%" : 300,
        flexShrink: 0,
        display: "flex", flexDirection: "column",
        borderRight: mobile ? "none" : "0.5px solid var(--rule-md)",
        background: "var(--bg)",
        overflow: "hidden",
        height: "100%",
      }}>
        {/* Header */}
        <div style={{ padding: "14px 14px 10px", borderBottom: "0.5px solid var(--rule)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <h1 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.025em" }}>
                Leads
              </h1>
              <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>
                {loading ? "Loading…" : `${total} total · ${newCount} new`}
              </p>
            </div>
            <button
              onClick={() => setShowFilters((p) => !p)}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: `0.5px solid ${showFilters ? "var(--accent)" : "var(--rule-md)"}`,
                background: showFilters ? "var(--accent-muted)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: showFilters ? "var(--accent)" : "var(--ink-3)",
                cursor: "pointer", transition: "all 0.12s ease",
              }}
            >
              <SlidersHorizontal size={12} />
            </button>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={11} color="var(--ink-3)" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username or keyword…"
              style={{
                width: "100%", height: 30, borderRadius: 7,
                border: "0.5px solid var(--rule-md)", background: "var(--bg-subtle)",
                color: "var(--ink-1)", fontSize: 12, fontFamily: "var(--font-sans)",
                padding: "0 10px 0 26px", outline: "none",
                transition: "border-color 0.12s ease",
                boxSizing: "border-box",
                letterSpacing: "-0.005em",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
          </div>

          {/* Filter pills */}
          {showFilters && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {STATUS_FILTERS.map((f) => (
                  <Pill key={f.value} active={filterStatus === f.value} onClick={() => setFilterStatus(f.value)}>
                    {f.label}
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
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <LeadListSkeleton />
          ) : filtered.length === 0 ? (
            total === 0 ? (
              <LeadEmpty />
            ) : (
              <div style={{ padding: "28px 16px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8 }}>
                  No leads match your filters.
                </p>
                <button
                  onClick={() => { setSearch(""); setFilterStatus("all"); setFilterChannel("all"); }}
                  style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Clear filters
                </button>
              </div>
            )
          ) : (
            filtered.map((lead) => (
              <LeadRow
                key={lead._id}
                lead={lead as any}
                selected={selectedLeadId === lead._id}
                onClick={() => handleSelectLead(lead._id)}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Desktop ── */}
      <div className="leads-desktop" style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <ListPanel />

        {/* Right — conversation or empty state */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "var(--bg-subtle)" }}>
          {selectedLeadId ? (
            <LeadConversationPanel leadId={selectedLeadId} />
          ) : (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 10,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--bg)",
                border: "0.5px solid var(--rule-md)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MessageSquare size={18} color="var(--ink-3)" />
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-3)", letterSpacing: "-0.01em" }}>
                Select a lead to view conversation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="leads-mobile" style={{ flex: 1, display: "none", flexDirection: "column", overflow: "hidden" }}>
        {mobileView === "list" ? (
          <ListPanel mobile />
        ) : (
          selectedLeadId && (
            <LeadConversationPanel
              leadId={selectedLeadId}
              onClose={handleCloseConversation}
            />
          )
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .leads-desktop { display: flex !important; }
          .leads-mobile  { display: none  !important; }
        }
        @media (max-width: 767px) {
          .leads-desktop { display: none  !important; }
          .leads-mobile  { display: flex  !important; }
        }
      `}</style>
    </div>
  );
}