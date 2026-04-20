"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Zap,
  Users,
  MessageCircle,
  Plus,
  ArrowRight,
  Phone,
  Camera,
  BarChart2,
  GitBranch,
} from "lucide-react";
import { Sk } from "./_components/dash-skeleton";
import { StatCard } from "./_components/dash-stat-card";
import { ChannelRow } from "./_components/dash-channel-row";
import { QuickAction } from "./_components/dash-quick-action";
import { Card, CardHeader } from "./_components/dash-card";

export default function DashboardPage() {
  const stats = useQuery(api.accounts.getDashboardStats);
  const router = useRouter();
  const loading = stats === undefined;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 28px 64px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 32,
          gap: 16,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--ink-3)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {greeting}
          </p>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "var(--ink-1)",
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
            }}
          >
            Dashboard
          </h1>
        </div>
        <button
          onClick={() => router.push("/automations/new")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 36,
            padding: "0 16px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 980,
            fontSize: 13,
            fontWeight: 400,
            cursor: "pointer",
            flexShrink: 0,
            letterSpacing: "-0.01em",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={14} strokeWidth={2} />
          New automation
        </button>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 10,
        }}
        className="stat-grid"
      >
        <StatCard
          label="Active automations"
          value={stats?.activeAutomations ?? 0}
          sub={`${stats?.totalAutomations ?? 0} total`}
          icon={Zap}
          loading={loading}
          accent
        />
        <StatCard
          label="Leads today"
          value={stats?.leadsToday ?? 0}
          sub={`${stats?.totalLeads ?? 0} all time`}
          icon={Users}
          loading={loading}
        />
        <StatCard
          label="Messages sent"
          value={stats?.totalMessagesSent ?? 0}
          sub={`${stats?.conversionRate ?? 0}% conversion`}
          icon={MessageCircle}
          loading={loading}
        />
      </div>

      {/* Main grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 256px", gap: 10 }}
        className="main-grid"
      >
        {/* Leads panel */}
        <Card>
          <CardHeader
            title="Leads"
            action={
              <button
                onClick={() => router.push("/leads")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}
              >
                View all <ArrowRight size={12} />
              </button>
            }
          />

          {loading ? (
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 10, alignItems: "center" }}
                >
                  <Sk w={32} h={32} r={99} />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <Sk h={12} w="40%" r={4} />
                    <Sk h={10} w="60%" r={4} />
                  </div>
                  <Sk h={10} w={36} r={4} />
                </div>
              ))}
            </div>
          ) : (stats?.totalLeads ?? 0) > 0 ? (
            <div style={{ padding: "36px 24px", textAlign: "center" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 13,
                  background: "var(--accent-muted)",
                  border: "0.5px solid var(--accent-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Users size={20} color="var(--accent)" />
              </div>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--ink-1)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {stats?.totalLeads}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ink-3)",
                  marginBottom: 24,
                  letterSpacing: "-0.01em",
                }}
              >
                lead{(stats?.totalLeads ?? 0) !== 1 ? "s" : ""} captured
              </p>
              <button
                onClick={() => router.push("/leads")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 34,
                  padding: "0 16px",
                  borderRadius: 980,
                  fontSize: 13,
                  color: "var(--accent)",
                  background: "var(--accent-muted)",
                  border: "0.5px solid var(--accent-border)",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Manage leads <ArrowRight size={12} />
              </button>
            </div>
          ) : (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 13,
                  background: "var(--bg-subtle)",
                  border: "0.5px solid var(--rule-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Users size={20} color="var(--ink-3)" />
              </div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--ink-1)",
                  letterSpacing: "-0.02em",
                  marginBottom: 6,
                }}
              >
                No leads yet
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ink-3)",
                  lineHeight: 1.6,
                  maxWidth: 260,
                  margin: "0 auto 24px",
                }}
              >
                Create your first automation to start capturing leads
                automatically.
              </p>
              <button
                onClick={() => router.push("/automations/new")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 34,
                  padding: "0 16px",
                  borderRadius: 980,
                  fontSize: 13,
                  color: "var(--accent)",
                  background: "var(--accent-muted)",
                  border: "0.5px solid var(--accent-border)",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Plus size={13} /> Create automation
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
                <div
                  style={{
                    padding: "14px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <Sk h={34} r={8} />
                  <Sk h={34} r={8} />
                </div>
              ) : (
                <>
                  <div style={{ borderBottom: "0.5px solid var(--rule)" }}>
                    <ChannelRow
                      label="Instagram"
                      icon={Camera}
                      iconColor="#E1306C"
                      connected={stats?.instagramConnected ?? false}
                      onConnect={() => router.push("/settings")}
                    />
                  </div>
                  <ChannelRow
                    label="WhatsApp"
                    icon={Phone}
                    iconColor="#25D366"
                    connected={stats?.whatsappConnected ?? false}
                    onConnect={() => router.push("/settings")}
                  />
                </>
              )}
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader title="Quick actions" />
            <QuickAction
              label="New automation"
              sub="Set up a keyword trigger"
              icon={Zap}
              onClick={() => router.push("/automations/new")}
            />
            <QuickAction
              label="View analytics"
              sub="Messages, leads, conversion"
              icon={BarChart2}
              onClick={() => router.push("/analytics")}
            />
            <QuickAction
              label="Referral program"
              sub="Earn free months"
              icon={GitBranch}
              onClick={() => router.push("/referral")}
              isLast
            />
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
