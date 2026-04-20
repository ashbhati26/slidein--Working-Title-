"use client";

import { Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function LeadEmpty() {
  const router = useRouter();
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "56px 24px", textAlign: "center",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 13,
        background: "var(--bg-subtle)",
        border: "0.5px solid var(--rule-md)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}>
        <Users size={20} color="var(--ink-3)" />
      </div>
      <p style={{
        fontSize: 14, fontWeight: 500,
        color: "var(--ink-1)", letterSpacing: "-0.02em", marginBottom: 6,
      }}>
        No leads yet
      </p>
      <p style={{
        fontSize: 12, color: "var(--ink-3)",
        maxWidth: 220, lineHeight: 1.65, marginBottom: 20,
      }}>
        Leads appear when someone triggers your automation.
      </p>
      <button
        onClick={() => router.push("/automations/new")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          height: 32, padding: "0 14px", borderRadius: 980, fontSize: 12,
          background: "var(--accent)", color: "#fff",
          border: "none", cursor: "pointer",
          letterSpacing: "-0.01em",
          transition: "opacity 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <Zap size={12} /> Create automation
      </button>
    </div>
  );
}