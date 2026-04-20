"use client";

import { useState, useRef, useEffect } from "react";
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
    _id:     Id<"automations">;
    name:    string;
    channel: "instagram" | "whatsapp";
    status:  "active" | "paused" | "draft";
    trigger: { keywords: string[]; type: string };
    listener: { type: string };
    stats: { totalTriggers: number; totalLeads: number; totalRepliesSent: number };
    createdAt: number;
  };
  isLast?: boolean;
}

export function AutomationCard({ automation, isLast }: AutomationCardProps) {
  const router       = useRouter();
  const toggleStatus = useMutation(api.automations.toggleAutomationStatus);
  const deleteAuto   = useMutation(api.automations.deleteAutomation);

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toggling,   setToggling]   = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  // ── Fix: close menu when clicking outside ──────────────────
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    // Use capture so it fires before the row's onClick
    document.addEventListener("mousedown", handleOutside, true);
    return () => document.removeEventListener("mousedown", handleOutside, true);
  }, [menuOpen]);

  const isActive = automation.status === "active";
  const keyword  = automation.trigger.keywords?.[0] ?? "—";
  const isAI     = automation.listener.type === "smart_ai";

  const triggerLabel =
    automation.trigger.type === "ig_comment" ? "on comment" :
    automation.trigger.type === "ig_dm"      ? "on DM"      : "on message";

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setToggling(true);
    try { await toggleStatus({ automationId: automation._id }); }
    finally { setToggling(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try { await deleteAuto({ automationId: automation._id }); setDeleteOpen(false); }
    finally { setDeleting(false); }
  }

  return (
    <>
      <div
        onClick={() => router.push(`/automations/${automation._id}`)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: isLast ? "none" : "0.5px solid var(--rule)", cursor: "pointer", transition: "background 0.1s ease", borderRadius: isLast ? "0 0 14px 14px" : 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <StatusDot status={automation.status} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>{automation.name}</span>
            <ChannelBadge channel={automation.channel} />
            {isAI && (
              <span style={{ fontSize: 9, fontWeight: 600, color: "var(--accent)", background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", borderRadius: 99, padding: "2px 6px" }}>
                Smart AI
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-3)", background: "var(--bg-subtle)", border: "0.5px solid var(--rule-md)", borderRadius: 5, padding: "1px 6px", fontFamily: "monospace", letterSpacing: "0.04em" }}>
              {keyword}
            </span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{triggerLabel}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 18, flexShrink: 0 }} className="auto-stats">
          {[
            { icon: Users,         val: automation.stats.totalLeads,       label: "leads"   },
            { icon: MessageCircle, val: automation.stats.totalRepliesSent, label: "replies" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                <Icon size={10} color="var(--ink-3)" />
                <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.03em" }}>{val}</span>
              </div>
              <span style={{ fontSize: 9, color: "var(--ink-3)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle} disabled={toggling}
          title={isActive ? "Pause" : "Activate"}
          style={{ width: 36, height: 20, borderRadius: 99, border: "none", cursor: toggling ? "wait" : "pointer", background: isActive ? "var(--accent)" : "var(--rule-md)", position: "relative", flexShrink: 0, transition: "background 0.2s ease", opacity: toggling ? 0.6 : 1 }}
        >
          <span style={{ position: "absolute", top: 2, left: isActive ? 17 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left 0.2s cubic-bezier(0.16,1,0.36,1)" }} />
        </button>

        {/* ── More menu — fixed with useRef + portal-style z-index ── */}
        <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            style={{ width: 26, height: 26, borderRadius: 6, border: "0.5px solid var(--rule-md)", background: menuOpen ? "var(--bg-hover)" : "transparent", cursor: "pointer", color: menuOpen ? "var(--ink-1)" : "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--ink-1)"; }}
            onMouseLeave={(e) => { if (!menuOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; } }}
          >
            <MoreHorizontal size={13} />
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 100,
              background: "var(--bg)", border: "0.5px solid var(--rule-md)",
              borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)",
              minWidth: 148, overflow: "hidden",
            }}>
              <button
                onClick={(e) => { setMenuOpen(false); handleToggle(e); }}
                style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "var(--ink-2)", textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {isActive ? <Pause size={12} /> : <Play size={12} />}
                {isActive ? "Pause" : "Activate"}
              </button>
              <div style={{ height: "0.5px", background: "var(--rule)" }} />
              <button
                onClick={() => { setMenuOpen(false); setDeleteOpen(true); }}
                style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "var(--red)", textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal isOpen={deleteOpen} name={automation.name} loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
      <style>{`@media(max-width:600px){.auto-stats{display:none!important}}`}</style>
    </>
  );
}