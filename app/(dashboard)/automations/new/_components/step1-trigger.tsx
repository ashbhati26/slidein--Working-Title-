"use client";

import {
  CheckCircle,
  Lock,
  MessageSquare,
  MessageCircle,
  Phone,
} from "lucide-react";
import { NavButtons } from "./nav-buttons";

export type TriggerType = "ig_comment" | "ig_dm" | "wa_message";

interface Step1TriggerProps {
  triggerType: TriggerType | null;
  plan: string;
  igConnected: boolean;
  waConnected: boolean;
  onSelect: (t: TriggerType) => void;
  onNext: () => void;
}

const OPTIONS = [
  {
    type: "ig_comment" as TriggerType,
    icon: MessageSquare,
    color: "#E1306C",
    bg: "rgba(225,48,108,.08)",
    label: "Instagram Comment",
    desc: "When someone comments a keyword on your post or reel, send them a DM instantly.",
    tag: "Most popular",
    needsIg: true,
    needsWa: false,
    needsPaid: false,
  },
  {
    type: "ig_dm" as TriggerType,
    icon: MessageCircle,
    color: "#E1306C",
    bg: "rgba(225,48,108,.08)",
    label: "Instagram DM",
    desc: "When someone DMs your account with a keyword, reply automatically.",
    tag: null,
    needsIg: true,
    needsWa: false,
    needsPaid: false,
  },
  {
    type: "wa_message" as TriggerType,
    icon: Phone,
    color: "#25D366",
    bg: "rgba(37,211,102,.08)",
    label: "WhatsApp Message",
    desc: "When someone messages your WhatsApp Business number with a keyword, reply.",
    tag: null,
    needsIg: false,
    needsWa: true,
    needsPaid: true,
  },
];

export function Step1Trigger({
  triggerType,
  plan,
  igConnected,
  waConnected,
  onSelect,
  onNext,
}: Step1TriggerProps) {
  return (
    <div>
      <p
        style={{
          fontSize: 13,
          color: "var(--ink-3)",
          marginBottom: 20,
          lineHeight: 1.6,
          letterSpacing: "-0.005em",
        }}
      >
        Choose what triggers this automation. Svation fires the moment someone
        sends the keyword.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {OPTIONS.map(
          ({
            type,
            icon: Icon,
            color,
            bg,
            label,
            desc,
            tag,
            needsIg,
            needsWa,
            needsPaid,
          }) => {
            const locked =
              (needsIg && !igConnected) ||
              (needsWa && !waConnected) ||
              (needsPaid && plan === "starter");
            const lockMsg =
              needsPaid && plan === "starter"
                ? "Creator plan required"
                : needsIg && !igConnected
                  ? "Connect Instagram first"
                  : needsWa && !waConnected
                    ? "Connect WhatsApp first"
                    : "";
            const selected = triggerType === type;

            return (
              <button
                key={type}
                onClick={() => !locked && onSelect(type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 12,
                  textAlign: "left",
                  border: `1px solid ${selected ? "var(--accent)" : "var(--rule-md)"}`,
                  background: selected
                    ? "var(--accent-muted)"
                    : locked
                      ? "var(--bg-subtle)"
                      : "var(--bg)",
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.55 : 1,
                  transition: "all 0.12s ease",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: selected ? "var(--accent)" : "var(--ink-1)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {label}
                    </span>
                    {tag && !locked && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: "var(--accent)",
                          background: "var(--accent-muted)",
                          border: "0.5px solid var(--accent-border)",
                          borderRadius: 99,
                          padding: "2px 7px",
                        }}
                      >
                        {tag}
                      </span>
                    )}
                    {locked && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 9,
                          fontWeight: 600,
                          color: "var(--yellow)",
                          background: "var(--yellow-muted)",
                          border: "0.5px solid var(--yellow-border)",
                          borderRadius: 99,
                          padding: "2px 7px",
                        }}
                      >
                        <Lock size={7} /> {lockMsg}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ink-3)",
                      lineHeight: 1.55,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {desc}
                  </p>
                </div>
                {selected && (
                  <CheckCircle
                    size={16}
                    color="var(--accent)"
                    style={{ flexShrink: 0 }}
                  />
                )}
              </button>
            );
          },
        )}
      </div>

      <NavButtons onNext={onNext} nextDisabled={!triggerType} />
    </div>
  );
}
