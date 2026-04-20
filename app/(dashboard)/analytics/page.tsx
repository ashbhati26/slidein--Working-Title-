"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatCard }               from "./_components/stat-card";
import { TrendChart }             from "./_components/trend-chart";
import { StatusChart }            from "./_components/status-chart";
import { ChannelSplit, TopKeywords } from "./_components/channel-split";
import { AutomationTable }        from "./_components/automation-table";

function Sk({ w = "100%", h = 80, r = 14 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "var(--rule)",
      animation: "sk 1.6s ease-in-out infinite",
    }} />
  );
}

export default function AnalyticsPage() {
  const data    = useQuery(api.accounts.getAnalytics);
  const loading = data === undefined;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 28px 64px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 4 }}>
          Analytics
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-3)", letterSpacing: "-0.01em" }}>
          Automation performance and lead insights.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[1,2,3].map((i) => <Sk key={i} h={90} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[1,2,3].map((i) => <Sk key={i} h={90} />)}
          </div>
          <Sk h={140} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Sk h={220} /><Sk h={220} />
          </div>
          <Sk h={180} />
          <Sk h={240} />
          <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && !data && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Unable to load. Please refresh.</p>
        </div>
      )}

      {/* Content */}
      {!loading && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Row 1 — 3 primary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="stat-grid-3">
            <StatCard label="Total leads"    value={data.totalLeads}    sub={`${data.leadsLast7Days} this week`} accent />
            <StatCard label="Messages sent"  value={data.totalMessages} sub="All time" />
            <StatCard label="Triggers fired" value={data.totalTriggers} sub="All automations" />
          </div>

          {/* Row 2 — 3 secondary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="stat-grid-3">
            <StatCard label="Converted"       value={data.convertedLeads} sub={`${data.conversionRate}% rate`} color="var(--green)" />
            <StatCard label="AI conversations" value={data.aiLeads}       sub="Smart AI leads" />
            <StatCard label="In drip"          value={data.dripLeads}     sub="Sequences running" />
          </div>

          {/* Row 3 — Trend full width */}
          <TrendChart data={data.trend7d} />

          {/* Row 4 — Status + Channel side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="split-grid">
            <StatusChart counts={data.statusCounts} total={data.totalLeads} />
            <ChannelSplit igLeads={data.igLeads} waLeads={data.waLeads} total={data.totalLeads} />
          </div>

          {/* Row 5 — Top keywords */}
          <TopKeywords keywords={data.topKeywords} />

          {/* Row 6 — Automation table */}
          <AutomationTable rows={data.automationStats as any} />

          {/* Empty hint */}
          {data.totalLeads === 0 && (
            <div style={{
              padding: "20px 22px", borderRadius: 14, textAlign: "center",
              background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)",
            }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--accent)", marginBottom: 4 }}>No data yet</p>
              <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
                Analytics populate once your automations start receiving leads.
              </p>
            </div>
          )}

        </div>
      )}

      <style>{`
        @keyframes sk { 0%,100%{opacity:1} 50%{opacity:.45} }
        @media (max-width: 680px) {
          .stat-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .split-grid  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) {
          .stat-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}