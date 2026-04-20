"use client";

import { Id } from "@/convex/_generated/dataModel";
import { LeadAvatar }      from "./lead-avatar";
import { LeadStatusBadge } from "./lead-status-badge";
import { Bot, Clock } from "lucide-react";

type LeadStatus = "new" | "in_conversation" | "qualified" | "converted" | "opted_out" | "lost";

interface LeadRowProps {
  lead: {
    _id:                  Id<"leads">;
    channel:              "instagram" | "whatsapp";
    status:               LeadStatus;
    senderId:             string;
    senderUsername?:      string;
    senderProfilePicUrl?: string;
    triggerKeyword:       string;
    aiSessionActive:      boolean;
    humanTookOver:        boolean;
    dripStatus:           string;
    createdAt:            number;
    lastInboundAt?:       number;
    lastMessage:          { messageText: string; role: string; sentAt: number } | null;
  };
  selected: boolean;
  onClick:  () => void;
}

function timeAgo(ts: number): string {
  const diff    = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  if (minutes < 1)  return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours   < 24) return `${hours}h`;
  if (days    < 7)  return `${days}d`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function LeadRow({ lead, selected, onClick }: LeadRowProps) {
  const displayName = lead.senderUsername
    ? `@${lead.senderUsername}`
    : lead.senderId.slice(0, 10) + "…";

  const lastMsg = lead.lastMessage?.messageText ?? "";
  const preview = lastMsg.length > 52 ? lastMsg.slice(0, 52) + "…" : lastMsg;
  const ts      = lead.lastMessage?.sentAt ?? lead.createdAt;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 11,
        padding: "11px 14px",
        background: selected ? "var(--accent-muted)" : "transparent",
        borderBottom: "0.5px solid var(--rule)",
        borderLeft: `2px solid ${selected ? "var(--accent)" : "transparent"}`,
        cursor: "pointer",
        transition: "background 0.1s ease",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      <LeadAvatar
        username={lead.senderUsername}
        profilePicUrl={lead.senderProfilePicUrl}
        channel={lead.channel}
        size={36}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1 — name + time */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: selected ? "var(--accent)" : "var(--ink-1)",
            letterSpacing: "-0.01em",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: 130,
          }}>
            {displayName}
          </span>
          <span style={{ fontSize: 10, color: "var(--ink-3)", flexShrink: 0, marginLeft: 4 }}>
            {timeAgo(ts)}
          </span>
        </div>

        {/* Row 2 — preview + badges */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <p style={{
            fontSize: 11, color: "var(--ink-3)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            flex: 1, letterSpacing: "-0.005em",
          }}>
            {preview || <span style={{ fontStyle: "italic" }}>{lead.triggerKeyword}</span>}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
            {lead.aiSessionActive && <Bot  size={9} color="var(--accent)" />}
            {lead.dripStatus === "running" && <Clock size={9} color="var(--yellow)" />}
            <LeadStatusBadge status={lead.status} />
          </div>
        </div>
      </div>
    </div>
  );
}