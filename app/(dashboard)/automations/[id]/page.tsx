// PAGE: /automations/[id] — Automation detail
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";
import {
  ArrowLeft, Zap, Users, MessageCircle, Camera, Phone,
  Pause, Play, Trash2, Bot, Clock, CheckCircle, ArrowRight,
} from "lucide-react";
import { DeleteConfirmModal } from "../_components/delete-confirm-modal";

function Sk({ w = "100%", h = 14, r = 5 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "var(--rule)", animation: "sk 1.6s ease-in-out infinite" }} />;
}

function StatBox({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div style={{
      flex: 1, padding: "16px 18px",
      background: "var(--bg)", border: "0.5px solid var(--rule-md)", borderRadius: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>{label}</span>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={11} color="var(--ink-3)" />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "var(--font-sans)" }}>
        {value.toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      padding: "11px 0",
      borderBottom: last ? "none" : "0.5px solid var(--rule)",
    }}>
      <span style={{ fontSize: 11, color: "var(--ink-3)", flexShrink: 0, marginRight: 16, letterSpacing: "-0.005em" }}>
        {label}
      </span>
      <div style={{ fontSize: 12, color: "var(--ink-1)", textAlign: "right" }}>{value}</div>
    </div>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "var(--bg)", border: "0.5px solid var(--rule-md)", borderRadius: 14, overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "0.5px solid var(--rule)" }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>{title}</p>
      {action}
    </div>
  );
}

export default function AutomationDetailPage() {
  const router       = useRouter();
  const params       = useParams();
  const automationId = params.id as Id<"automations">;

  const automation   = useQuery(api.automations.getAutomation, { automationId });
  const leads        = useQuery(api.leads.listLeads, { automationId, limit: 8 });
  const toggleStatus = useMutation(api.automations.toggleAutomationStatus);
  const deleteAuto   = useMutation(api.automations.deleteAutomation);

  const [toggling,   setToggling]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      await toggleStatus({ automationId });
      toast.success(automation?.status === "active" ? "Automation paused." : "Automation activated.");
    } catch { toast.error("Failed to update status."); }
    finally  { setToggling(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAuto({ automationId });
      toast.success("Automation deleted.");
      router.push("/automations");
    } catch { toast.error("Failed to delete."); setDeleting(false); }
  }

  /* ── Loading ── */
  if (automation === undefined) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 28px" }}>
        <Sk h={12} w={110} r={4} />
        <div style={{ marginTop: 20, marginBottom: 24 }}><Sk h={22} w={220} r={5} /></div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}><Sk h={80} r={12} /><Sk h={80} r={12} /><Sk h={80} r={12} /></div>
        <Sk h={260} r={14} />
        <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      </div>
    );
  }

  /* ── Not found ── */
  if (!automation) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 16 }}>Automation not found.</p>
        <button onClick={() => router.push("/automations")} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
          Back to automations
        </button>
      </div>
    );
  }

  const isActive  = automation.status === "active";
  const isIG      = automation.channel === "instagram";
  const isAI      = automation.listener.type === "smart_ai";

  const triggerLabel =
    automation.trigger.type === "ig_comment" ? "Instagram Comment" :
    automation.trigger.type === "ig_dm"      ? "Instagram DM"      : "WhatsApp Message";

  const statusColor =
    automation.status === "active" ? "var(--green)"  :
    automation.status === "paused" ? "var(--yellow)" : "var(--ink-3)";

  /* Info rows — only include rows that have data */
  const infoRows: { label: string; value: React.ReactNode }[] = [
    {
      label: "Trigger",
      value: (
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {isIG ? <Camera size={11} color="#E1306C" /> : <Phone size={11} color="#25D366" />}
          {triggerLabel}
        </span>
      ),
    },
    {
      label: "Keywords",
      value: (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {automation.trigger.keywords.map((kw) => (
            <span key={kw} style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", borderRadius: 5, padding: "2px 7px", fontFamily: "monospace", letterSpacing: "0.04em" }}>
              {kw}
            </span>
          ))}
        </div>
      ),
    },
    { label: "Match type", value: <span style={{ textTransform: "capitalize" }}>{automation.trigger.keywordMatchType}</span> },
    {
      label: "Reply type",
      value: (
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {isAI ? <Bot size={11} color="var(--accent)" /> : <MessageCircle size={11} color="var(--ink-3)" />}
          {isAI ? "Smart AI" : "Fixed message"}
        </span>
      ),
    },
    ...(!isAI && automation.listener.message?.text
      ? [{ label: "Message preview", value: <span style={{ fontSize: 11, color: "var(--ink-2)", maxWidth: 280, lineHeight: 1.5, textAlign: "right" as const, display: "block" }}>{automation.listener.message.text.length > 100 ? automation.listener.message.text.slice(0, 100) + "…" : automation.listener.message.text}</span> }]
      : []),
    ...(isAI && automation.listener.aiConfig
      ? [{ label: "AI language", value: <span style={{ textTransform: "capitalize" as const }}>{automation.listener.aiConfig.language}</span> }]
      : []),
    ...(automation.drip?.enabled
      ? [{ label: "Drip", value: <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--green)" }}><CheckCircle size={11} /> {automation.drip.steps.length} follow-up step{automation.drip.steps.length !== 1 ? "s" : ""}</span> }]
      : []),
    { label: "Created", value: new Date(automation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
    ...(automation.stats.lastTriggeredAt
      ? [{ label: "Last triggered", value: <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} color="var(--ink-3)" />{new Date(automation.stats.lastTriggeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} {new Date(automation.stats.lastTriggeredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</span> }]
      : []),
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 28px 80px" }}>

      {/* Back */}
      <button onClick={() => router.push("/automations")} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0, letterSpacing: "-0.005em" }}>
        <ArrowLeft size={13} /> Automations
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          {/* Status dot + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, flexShrink: 0, boxShadow: isActive ? "0 0 0 2px rgba(52,199,89,.2)" : "none" }} />
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.03em" }}>
              {automation.name}
            </h1>
          </div>
          {/* Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ink-3)", padding: "2px 9px", borderRadius: 99, background: "var(--bg-subtle)", border: "0.5px solid var(--rule-md)" }}>
              {isIG ? <Camera size={10} color="#E1306C" /> : <Phone size={10} color="#25D366" />}
              {isIG ? "Instagram" : "WhatsApp"}
            </span>
            {isAI && (
              <span style={{ fontSize: 11, color: "var(--accent)", padding: "2px 9px", borderRadius: 99, background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)" }}>
                Smart AI
              </span>
            )}
            <span style={{ fontSize: 11, color: statusColor, padding: "2px 9px", borderRadius: 99, background: `${statusColor}15`, border: `0.5px solid ${statusColor}30`, textTransform: "capitalize" }}>
              {automation.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={handleToggle} disabled={toggling} style={{
            display: "flex", alignItems: "center", gap: 5,
            height: 32, padding: "0 14px", borderRadius: 980, fontSize: 12,
            border: `0.5px solid ${isActive ? "var(--yellow-border)" : "var(--green-border)"}`,
            background: isActive ? "var(--yellow-muted)" : "var(--green-muted)",
            color: isActive ? "var(--yellow)" : "var(--green)",
            cursor: toggling ? "wait" : "pointer", opacity: toggling ? 0.6 : 1, transition: "opacity 0.12s ease",
          }}>
            {isActive ? <Pause size={12} /> : <Play size={12} />}
            {toggling ? "Updating…" : isActive ? "Pause" : "Activate"}
          </button>
          <button onClick={() => setDeleteOpen(true)} style={{
            display: "flex", alignItems: "center", gap: 5,
            height: 32, padding: "0 14px", borderRadius: 980, fontSize: 12,
            border: "0.5px solid var(--red-border)", background: "var(--red-muted)", color: "var(--red)", cursor: "pointer",
          }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <StatBox label="Total triggers" value={automation.stats.totalTriggers}    icon={Zap}           />
        <StatBox label="Leads captured" value={automation.stats.totalLeads}       icon={Users}         />
        <StatBox label="Replies sent"   value={automation.stats.totalRepliesSent} icon={MessageCircle} />
      </div>

      {/* Configuration */}
      <Card style={{ marginBottom: 12 }}>
        <CardHeader title="Configuration" />
        <div style={{ padding: "0 18px" }}>
          {infoRows.map((row, i) => (
            <InfoRow key={row.label} label={row.label} value={row.value} last={i === infoRows.length - 1} />
          ))}
        </div>
      </Card>

      {/* Recent leads */}
      <Card>
        <CardHeader
          title="Recent leads"
          action={
            <button onClick={() => router.push("/leads")} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.005em" }}>
              View all <ArrowRight size={11} />
            </button>
          }
        />

        {leads === undefined ? (
          <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map((i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Sk w={30} h={30} r={99} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  <Sk h={11} w="32%" r={4} /><Sk h={9} w="50%" r={4} />
                </div>
                <Sk h={18} w={56} r={99} />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: "36px 24px", textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--bg-subtle)", border: "0.5px solid var(--rule-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Users size={18} color="var(--ink-3)" />
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", marginBottom: 4, letterSpacing: "-0.01em" }}>No leads yet</p>
            <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>Leads appear here when someone triggers this automation.</p>
          </div>
        ) : (
          leads.map((lead, i) => {
            const lc =
              lead.status === "converted"       ? "var(--green)"  :
              lead.status === "in_conversation" ? "var(--accent)" :
              lead.status === "opted_out"       ? "var(--red)"    : "var(--ink-3)";
            return (
              <div key={lead._id}
                onClick={() => router.push("/leads")}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", borderBottom: i < leads.length - 1 ? "0.5px solid var(--rule)" : "none", cursor: "pointer", transition: "background 0.1s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--accent)", flexShrink: 0 }}>
                  {(lead.senderUsername?.[0] ?? lead.senderId[0] ?? "?").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-1)", marginBottom: 2, letterSpacing: "-0.01em" }}>
                    {lead.senderUsername ? `@${lead.senderUsername}` : lead.senderId}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Triggered <span style={{ fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.03em" }}>{lead.triggerKeyword}</span>
                    {" · "}{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: lc, background: `${lc}15`, border: `0.5px solid ${lc}30`, borderRadius: 99, padding: "2px 8px", whiteSpace: "nowrap", textTransform: "capitalize", flexShrink: 0 }}>
                  {lead.status.replace("_", " ")}
                </span>
              </div>
            );
          })
        )}
      </Card>

      <DeleteConfirmModal
        isOpen={deleteOpen} name={automation.name} loading={deleting}
        onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)}
      />

      <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  );
}