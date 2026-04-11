"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Zap, Users, MessageCircle, Plus,
  TrendingUp, Phone, Camera, ChevronRight,
} from "lucide-react";

/* ── Skeleton ─────────────────────────────────────────────── */
function Sk({ w = "100%", h = 16, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "var(--rule-md)",
      animation: "sk 1.6s ease-in-out infinite",
    }} />
  );
}

/* ── Stat Card ────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, loading, accent,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; loading: boolean; accent?: boolean;
}) {
  return (
    <div style={{
      padding: "20px 20px 18px",
      background: accent ? "var(--accent)" : "var(--bg)",
      border: accent ? "none" : "0.5px solid var(--rule-md)",
      borderRadius: 18,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 16,
      }}>
        <span className="t-body-sm" style={{ color: accent ? "rgba(255,255,255,0.6)" : undefined }}>
          {label}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: accent ? "rgba(255,255,255,0.14)" : "var(--bg-subtle)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={13} color={accent ? "rgba(255,255,255,0.85)" : "var(--ink-3)"} />
        </div>
      </div>

      {loading ? (
        <>
          <Sk h={32} w="50%" r={6} />
          <div style={{ marginTop: 8 }}><Sk h={11} w="65%" r={4} /></div>
        </>
      ) : (
        <>
          <div className="t-stat" style={{
            fontSize: "clamp(28px, 3vw, 36px)",
            color: accent ? "var(--ink-inv)" : "var(--ink-1)",
            marginBottom: 6,
          }}>
            {value}
          </div>
          <p className="t-body-sm" style={{ color: accent ? "rgba(255,255,255,0.5)" : undefined }}>
            {sub}
          </p>
        </>
      )}
    </div>
  );
}

/* ── Channel Row ──────────────────────────────────────────── */
function ChannelRow({
  label, icon: Icon, connected, onConnect,
}: {
  label: string; icon: React.ElementType; connected: boolean; onConnect: () => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: connected ? "var(--accent-muted)" : "var(--bg-subtle)",
          border: `0.5px solid ${connected ? "var(--accent-border)" : "var(--rule-md)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={14} color={connected ? "var(--accent)" : "var(--ink-3)"} />
        </div>
        <div>
          <p className="t-body-sm" style={{ color: "var(--ink-1)", fontSize: 13 }}>{label}</p>
          <p className="t-caption" style={{ color: connected ? "var(--green)" : "var(--ink-3)" }}>
            {connected ? "Connected" : "Not connected"}
          </p>
        </div>
      </div>

      {connected ? (
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: "var(--green)",
          background: "var(--green-muted)",
          borderRadius: 980, padding: "3px 9px",
        }}>
          Active
        </span>
      ) : (
        <button
          onClick={onConnect}
          className="btn"
          style={{
            height: 28, padding: "0 12px", fontSize: 12,
            color: "var(--accent-text)",
            background: "var(--accent-muted)",
            border: "0.5px solid var(--accent-border)",
            borderRadius: 980,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.72")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Connect
        </button>
      )}
    </div>
  );
}

/* ── Card ─────────────────────────────────────────────────── */
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--bg)",
      border: "0.5px solid var(--rule-md)",
      borderRadius: 18,
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Card Header ──────────────────────────────────────────── */
function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "0.5px solid var(--rule)",
    }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
        {title}
      </span>
      {action}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const stats   = useQuery(api.accounts.getDashboardStats);
  const router  = useRouter();
  const loading = stats === undefined;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 56px" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: 28,
      }}>
        <div>
          <h1 style={{
            fontSize: 28, fontWeight: 600,
            color: "var(--ink-1)", letterSpacing: "-0.03em", marginBottom: 4,
          }}>
            Dashboard
          </h1>
          <p className="t-body-sm">Here's what's happening with your automations.</p>
        </div>
        <button
          onClick={() => router.push("/automations/new")}
          className="btn btn-primary"
          style={{ height: 34, padding: "0 16px", fontSize: 13, flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={14} strokeWidth={2} /> New automation
        </button>
      </div>

      {/* Stat cards */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 10 }}
        className="stat-grid"
      >
        <StatCard label="Active automations" value={stats?.activeAutomations ?? 0} sub={`${stats?.totalAutomations ?? 0} total`}          icon={Zap}           loading={loading} accent />
        <StatCard label="Leads today"        value={stats?.leadsToday ?? 0}         sub={`${stats?.totalLeads ?? 0} all time`}             icon={Users}         loading={loading} />
        <StatCard label="Messages sent"      value={stats?.totalMessagesSent ?? 0}  sub={`${stats?.conversionRate ?? 0}% conversion rate`} icon={MessageCircle} loading={loading} />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 268px", gap: 10 }} className="main-grid">

        {/* Recent leads */}
        <Card>
          <CardHeader
            title="Recent leads"
            action={
              <button
                onClick={() => router.push("/leads")}
                style={{
                  display: "flex", alignItems: "center", gap: 3,
                  fontSize: 13, color: "var(--accent-text)",
                  background: "none", border: "none", cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}
              >
                View all <ChevronRight size={13} />
              </button>
            }
          />

          {loading ? (
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Sk w={32} h={32} r={99} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <Sk h={12} w="40%" r={4} />
                    <Sk h={10} w="60%" r={4} />
                  </div>
                  <Sk h={10} w={36} r={4} />
                </div>
              ))}
            </div>
          ) : (stats?.totalLeads ?? 0) > 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--accent-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <Users size={20} color="var(--accent)" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-1)", marginBottom: 4, letterSpacing: "-0.015em" }}>
                {stats?.totalLeads} lead{(stats?.totalLeads ?? 0) !== 1 ? "s" : ""} captured
              </p>
              <p className="t-body-sm" style={{ marginBottom: 20 }}>
                View your full leads list to manage conversations.
              </p>
              <button
                onClick={() => router.push("/leads")}
                className="btn"
                style={{
                  fontSize: 13, color: "var(--accent-text)",
                  background: "var(--accent-muted)",
                  border: "0.5px solid var(--accent-border)",
                  borderRadius: 980, height: 34,
                }}
              >
                View all leads
              </button>
            </div>
          ) : (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--bg-subtle)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <Users size={20} color="var(--ink-3)" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-1)", marginBottom: 4, letterSpacing: "-0.015em" }}>
                No leads yet
              </p>
              <p className="t-body-sm" style={{ marginBottom: 20, lineHeight: 1.55 }}>
                Create your first automation to start capturing leads automatically.
              </p>
              <button
                onClick={() => router.push("/automations/new")}
                className="btn"
                style={{
                  fontSize: 13, color: "var(--accent-text)",
                  background: "var(--accent-muted)",
                  border: "0.5px solid var(--accent-border)",
                  borderRadius: 980, height: 34,
                }}
              >
                Create automation
              </button>
            </div>
          )}
        </Card>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Channels */}
          <Card>
            <CardHeader title="Channels" />
            <div style={{ padding: "0 18px" }}>
              {loading ? (
                <div style={{ padding: "14px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                  <Sk h={32} r={8} />
                  <Sk h={32} r={8} />
                </div>
              ) : (
                <>
                  <div style={{ borderBottom: "0.5px solid var(--rule)" }}>
                    <ChannelRow label="Instagram" icon={Camera} connected={stats?.instagramConnected ?? false} onConnect={() => router.push("/settings")} />
                  </div>
                  <ChannelRow label="WhatsApp" icon={Phone} connected={stats?.whatsappConnected ?? false} onConnect={() => router.push("/settings")} />
                </>
              )}
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader title="Quick actions" />
            {[
              { label: "New automation",   href: "/automations/new", icon: Zap },
              { label: "View leads",       href: "/leads",           icon: Users },
              { label: "Connect channels", href: "/settings",        icon: TrendingUp },
            ].map(({ label, href, icon: Icon }, i) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "11px 18px",
                  background: "none", border: "none",
                  borderBottom: i < 2 ? "0.5px solid var(--rule)" : "none",
                  cursor: "pointer", textAlign: "left",
                  fontSize: 13, fontWeight: 400, color: "var(--ink-2)",
                  transition: "background 0.1s ease",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Icon size={13} color="var(--ink-3)" />
                {label}
                <ChevronRight size={12} color="var(--ink-3)" style={{ marginLeft: "auto" }} />
              </button>
            ))}
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes sk { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @media (max-width: 768px) {
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}