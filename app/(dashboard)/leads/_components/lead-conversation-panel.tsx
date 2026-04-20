"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Bot, User, Clock, Zap, Brain,
  RotateCcw, X, Send, Loader2, Camera, Phone,
} from "lucide-react";
import { LeadAvatar }      from "./lead-avatar";
import { LeadStatusBadge } from "./lead-status-badge";

type LeadStatus = "new" | "in_conversation" | "qualified" | "converted" | "opted_out" | "lost";

interface LeadConversationPanelProps {
  leadId:   Id<"leads">;
  onClose?: () => void;
}

function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  }) + " · " + new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

function Sk({ w = "100%", h = 14, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "var(--rule)", animation: "sk 1.6s ease-in-out infinite" }} />;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new",             label: "New"             },
  { value: "in_conversation", label: "In conversation" },
  { value: "qualified",       label: "Qualified"       },
  { value: "converted",       label: "Converted"       },
  { value: "lost",            label: "Lost"            },
];

export function LeadConversationPanel({ leadId, onClose }: LeadConversationPanelProps) {
  const lead         = useQuery(api.leads.getLead, { leadId });
  const takeOver     = useMutation(api.leads.takeOverLead);
  const updateStatus = useMutation(api.leads.updateLeadStatus);
  const sendReply    = useAction(api.leads.sendManualReply);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [takingOver,     setTakingOver]     = useState(false);
  const [replyText,      setReplyText]      = useState("");
  const [sending,        setSending]        = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lead?.messages?.length]);

  const loading = lead === undefined;

  async function handleTakeOver(resumeAi: boolean) {
    setTakingOver(true);
    try {
      await takeOver({ leadId, resumeAi });
      toast.success(resumeAi ? "AI resumed." : "You've taken over. AI is paused.");
    } catch { toast.error("Failed to update."); }
    finally  { setTakingOver(false); }
  }

  async function handleStatusChange(status: LeadStatus) {
    setUpdatingStatus(true);
    try {
      await updateStatus({ leadId, status });
      toast.success("Status updated.");
    } catch { toast.error("Failed to update status."); }
    finally  { setUpdatingStatus(false); }
  }

  async function handleSendReply() {
    const text = replyText.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await sendReply({ leadId, message: text });
      setReplyText("");
      textareaRef.current?.focus();
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Failed to send. Please try again.");
    } finally { setSending(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendReply();
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20, gap: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
          <Sk w={36} h={36} r={99} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <Sk h={13} w="38%" r={4} />
            <Sk h={9}  w="55%" r={4} />
          </div>
        </div>
        {[1,2,3,4].map((i) => (
          <div key={i} style={{ display: "flex", flexDirection: i % 2 === 0 ? "row-reverse" : "row", gap: 8 }}>
            <Sk w={i % 2 === 0 ? "52%" : "62%"} h={38} r={10} />
          </div>
        ))}
        <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Lead not found.</p>
      </div>
    );
  }

  const displayName = lead.senderUsername ? `@${lead.senderUsername}` : lead.senderId;
  const isIG        = lead.channel === "instagram";
  const messages    = lead.messages ?? [];
  const isOptedOut  = lead.status === "opted_out";
  const windowOpen  = lead.windowOpen;
  const canSend     = !isOptedOut;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "0.5px solid var(--rule)",
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--bg)", flexShrink: 0,
      }}>
        <LeadAvatar
          username={lead.senderUsername}
          profilePicUrl={lead.senderProfilePicUrl}
          channel={lead.channel}
          size={34}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
              {displayName}
            </span>
            <LeadStatusBadge status={lead.status as LeadStatus} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "var(--ink-3)" }}>
              {isIG ? <Camera size={9} color="#E1306C" /> : <Phone size={9} color="#25D366" />}
              {isIG ? "Instagram" : "WhatsApp"}
            </span>
            <span style={{ fontSize: 10, color: "var(--rule-lg)" }}>·</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-3)", fontFamily: "monospace", letterSpacing: "0.04em" }}>
              {lead.triggerKeyword}
            </span>
            {lead.aiSessionActive && (
              <>
                <span style={{ fontSize: 10, color: "var(--rule-lg)" }}>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "var(--accent)" }}>
                  <Bot size={9} /> AI active
                </span>
              </>
            )}
            {lead.humanTookOver && (
              <>
                <span style={{ fontSize: 10, color: "var(--rule-lg)" }}>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "var(--yellow)" }}>
                  <User size={9} /> You took over
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
          {lead.aiSessionActive && !lead.humanTookOver && (
            <button
              onClick={() => handleTakeOver(false)}
              disabled={takingOver}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                height: 28, padding: "0 10px", borderRadius: 7, fontSize: 11,
                background: "var(--yellow-muted)", color: "var(--yellow)",
                border: "0.5px solid var(--yellow-border)", cursor: "pointer",
                opacity: takingOver ? 0.6 : 1,
              }}
            >
              <User size={10} /> Take over
            </button>
          )}
          {lead.humanTookOver && (
            <button
              onClick={() => handleTakeOver(true)}
              disabled={takingOver}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                height: 28, padding: "0 10px", borderRadius: 7, fontSize: 11,
                background: "var(--accent-muted)", color: "var(--accent)",
                border: "0.5px solid var(--accent-border)", cursor: "pointer",
                opacity: takingOver ? 0.6 : 1,
              }}
            >
              <RotateCcw size={10} /> Resume AI
            </button>
          )}

          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
            disabled={updatingStatus}
            style={{
              height: 28, padding: "0 6px", borderRadius: 7, fontSize: 11,
              border: "0.5px solid var(--rule-md)", background: "var(--bg-subtle)",
              color: "var(--ink-2)", cursor: "pointer", outline: "none",
              fontFamily: "var(--font-sans)",
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: "0.5px solid var(--rule-md)", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--ink-3)", cursor: "pointer",
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Info bar ── */}
      <div style={{
        display: "flex",
        borderBottom: "0.5px solid var(--rule)",
        background: "var(--bg-subtle)", flexShrink: 0,
      }}>
        {[
          { label: "Automation", value: lead.automation?.name ?? "—",       icon: Zap   },
          { label: "Drip",       value: lead.dripStatus ?? "none",           icon: Clock },
          { label: "Window",     value: windowOpen ? "Open" : "Closed",     icon: Brain },
        ].map((item, i) => (
          <div key={item.label} style={{
            flex: 1, padding: "7px 12px",
            borderRight: i < 2 ? "0.5px solid var(--rule)" : "none",
          }}>
            <p style={{
              fontSize: 9, color: "var(--ink-3)",
              letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2,
            }}>
              {item.label}
            </p>
            <p style={{
              fontSize: 11, fontWeight: 500,
              color: item.label === "Window" && !windowOpen ? "var(--red)" : "var(--ink-1)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              textTransform: "capitalize", letterSpacing: "-0.005em",
            }}>
              {item.value.replace(/_/g, " ")}
            </p>
          </div>
        ))}
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "16px 16px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser  = msg.role === "user";
            const isAI    = msg.source === "ai";
            const isDrip  = msg.source === "drip";
            const isHuman = msg.source === "human";

            return (
              <div
                key={msg._id}
                style={{
                  display: "flex",
                  flexDirection: isUser ? "row" : "row-reverse",
                  gap: 7, alignItems: "flex-end",
                }}
              >
                {/* Avatar dot */}
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: isUser
                    ? "var(--bg-subtle)"
                    : isAI
                    ? "var(--accent)"
                    : isHuman
                    ? "var(--green-muted)"
                    : "var(--bg-subtle)",
                  border: isAI ? "none" : "0.5px solid var(--rule-md)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isUser
                    ? <User size={11} color="var(--ink-3)" />
                    : isAI
                    ? <Bot  size={11} color="#fff" />
                    : isHuman
                    ? <User size={11} color="var(--green)" />
                    : <Zap  size={11} color="var(--ink-3)" />
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: "70%",
                  display: "flex", flexDirection: "column",
                  gap: 3,
                  alignItems: isUser ? "flex-start" : "flex-end",
                }}>
                  <div style={{
                    padding: "8px 12px",
                    borderRadius: isUser ? "12px 12px 12px 3px" : "12px 12px 3px 12px",
                    background: isUser
                      ? "var(--bg)"
                      : isAI
                      ? "var(--accent)"
                      : isHuman
                      ? "var(--green-muted)"
                      : "var(--bg-card)",
                    border: isUser
                      ? "0.5px solid var(--rule-md)"
                      : isAI
                      ? "none"
                      : isHuman
                      ? "0.5px solid var(--green-border)"
                      : "0.5px solid var(--rule-md)",
                    fontSize: 13, lineHeight: 1.55,
                    color: isAI ? "#fff" : "var(--ink-1)",
                    letterSpacing: "-0.005em",
                    wordBreak: "break-word",
                  }}>
                    {msg.messageText}
                  </div>
                  <span style={{ fontSize: 9, color: "var(--ink-3)", padding: "0 3px", letterSpacing: "0.01em" }}>
                    {timeLabel(msg.sentAt)}
                    {isDrip  && " · drip"}
                    {isAI    && " · AI"}
                    {isHuman && " · you"}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Reply input ── */}
      <div style={{
        flexShrink: 0,
        borderTop: "0.5px solid var(--rule)",
        background: "var(--bg)",
        padding: "10px 14px",
      }}>
        {/* 24h window warning */}
        {!windowOpen && isIG && (
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 11px", borderRadius: 7, marginBottom: 8,
            background: "var(--yellow-muted)",
            border: "0.5px solid var(--yellow-border)",
          }}>
            <Clock size={11} color="var(--yellow)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.5 }}>
              24h window closed — Instagram may block this reply.
            </p>
          </div>
        )}

        {isOptedOut ? (
          <div style={{
            padding: "10px 12px", borderRadius: 8,
            background: "var(--bg-subtle)", border: "0.5px solid var(--rule-md)",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 11, color: "var(--ink-3)" }}>
              Lead opted out — messaging disabled.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Reply to ${displayName}… (⌘+Enter to send)`}
              rows={2}
              disabled={sending}
              style={{
                flex: 1, borderRadius: 9,
                border: "0.5px solid var(--rule-md)",
                background: "var(--bg-subtle)",
                color: "var(--ink-1)", fontSize: 13,
                fontFamily: "var(--font-sans)",
                padding: "9px 12px",
                outline: "none", resize: "none",
                lineHeight: 1.55,
                transition: "border-color 0.12s ease",
                opacity: sending ? 0.6 : 1,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sending}
              style={{
                width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                background: replyText.trim() && !sending ? "var(--accent)" : "var(--rule-md)",
                border: "none",
                cursor: replyText.trim() && !sending ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
              }}
            >
              {sending
                ? <Loader2 size={15} color="#fff" style={{ animation: "spin .7s linear infinite" }} />
                : <Send    size={15} color={replyText.trim() ? "#fff" : "var(--ink-3)"} />
              }
            </button>
          </div>
        )}

        {lead.aiSessionActive && !lead.humanTookOver && canSend && (
          <p style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 5, textAlign: "center" }}>
            AI is active — click <strong>Take over</strong> to pause before replying manually.
          </p>
        )}
      </div>

      <style>{`
        @keyframes sk   { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}