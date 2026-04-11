"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MoreHorizontal, Trash2, Pause, Play, Users, MessageCircle } from "lucide-react";
import { StatusDot } from "./status-dot";
import { ChannelBadge } from "./channel-badge";
import { DeleteConfirmModal } from "./delete-confirm-modal";

interface AutomationCardProps {
  automation: {
    _id:        Id<"automations">;
    name:       string;
    channel:    "instagram" | "whatsapp";
    status:     "active" | "paused" | "draft";
    trigger:    { keywords: string[]; type: string };
    listener:   { type: string };
    stats: {
      totalTriggers:    number;  // ✅ correct field name from schema
      totalLeads:       number;
      totalRepliesSent: number;  // ✅ correct field name from schema
    };
    createdAt: number;
  };
}

export function AutomationCard({ automation }: AutomationCardProps) {
  const router = useRouter();
  const toggleStatus = useMutation(api.automations.toggleAutomationStatus);
  const deleteAuto   = useMutation(api.automations.deleteAutomation);

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toggling,   setToggling]   = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const isActive = automation.status === "active";
  const keyword  = automation.trigger.keywords?.[0] ?? "—";
  const isAI     = automation.listener.type === "smart_ai";

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setToggling(true);
    try {
      await toggleStatus({ automationId: automation._id });
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAuto({ automationId: automation._id });
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  const triggerLabel =
    automation.trigger.type === "ig_comment" ? "on comment" :
    automation.trigger.type === "ig_dm"      ? "on DM"      : "on message";

  return (
    <>
      <div
        onClick={() => router.push(`/automations/${automation._id}`)}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: "1px solid var(--rule)", cursor: "pointer", transition: "background 0.1s ease", position: "relative" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Status dot */}
        <StatusDot status={automation.status} />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
              {automation.name}
            </span>
            <ChannelBadge channel={automation.channel} />
            {isAI && (
              <span style={{ fontSize: 10, fontWeight: 500, color: "var(--accent)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: 99, padding: "2px 7px" }}>
                Smart AI
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-3)", background: "var(--bg-subtle)", border: "1px solid var(--rule)", borderRadius: 5, padding: "2px 7px", fontFamily: "monospace" }}>
              {keyword}
            </span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{triggerLabel}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 20, flexShrink: 0 }} className="auto-stats">
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
              <Users size={11} color="var(--ink-3)" />
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 400, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>
                {automation.stats.totalLeads}
              </span>
            </div>
            <span style={{ fontSize: 10, color: "var(--ink-3)" }}>leads</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
              <MessageCircle size={11} color="var(--ink-3)" />
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 400, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>
                {automation.stats.totalRepliesSent}
              </span>
            </div>
            <span style={{ fontSize: 10, color: "var(--ink-3)" }}>replies</span>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={isActive ? "Pause" : "Activate"}
          style={{ width: 38, height: 21, borderRadius: 99, border: "none", cursor: toggling ? "wait" : "pointer", background: isActive ? "var(--accent)" : "var(--rule-md)", position: "relative", flexShrink: 0, transition: "background 0.2s ease", opacity: toggling ? 0.6 : 1 }}
        >
          <span style={{ position: "absolute", top: 3, left: isActive ? 19 : 3, width: 15, height: 15, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left 0.2s cubic-bezier(0.16,1,0.36,1)" }} />
        </button>

        {/* More menu */}
        <div style={{ position: "relative", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--rule)", background: "transparent", cursor: "pointer", color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.12s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--ink-1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setMenuOpen(false)} />
              <div style={{ position: "absolute", right: 0, top: 34, zIndex: 10, background: "var(--bg-card)", border: "1px solid var(--rule)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.1)", minWidth: 160, overflow: "hidden" }}>
                <button
                  onClick={(e) => { setMenuOpen(false); handleToggle(e); }}
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {isActive ? <Pause size={13} /> : <Play size={13} />}
                  {isActive ? "Pause" : "Activate"}
                </button>
                <div style={{ height: 1, background: "var(--rule)" }} />
                <button
                  onClick={() => { setMenuOpen(false); setDeleteOpen(true); }}
                  style={{ ...menuItemStyle, color: "var(--red)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        name={automation.name}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <style>{`
        @media (max-width: 600px) { .auto-stats { display: none !important; } }
      `}</style>
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  width: "100%", padding: "9px 12px",
  background: "transparent", border: "none",
  cursor: "pointer", textAlign: "left",
  fontSize: 13, fontWeight: 300, color: "var(--ink-2)",
  transition: "background 0.1s ease",
};