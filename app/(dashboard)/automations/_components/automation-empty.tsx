"use client";

import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function AutomationEmpty() {
  const router = useRouter();
  return (
    <div style={{
      padding: "64px 24px", display: "flex", flexDirection: "column",
      alignItems: "center", textAlign: "center",
      borderRadius: "0 0 14px 14px", /* round bottom since parent has no overflow:hidden */
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Zap size={20} color="var(--accent)" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.02em", marginBottom: 6 }}>
        No automations yet
      </p>
      <p style={{ fontSize: 13, color: "var(--ink-3)", maxWidth: 300, lineHeight: 1.65, marginBottom: 24 }}>
        Create your first automation to start capturing leads from Instagram or WhatsApp automatically.
      </p>
      <button
        onClick={() => router.push("/automations/new")}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 18px", borderRadius: 980, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, letterSpacing: "-0.01em", transition: "opacity 0.15s ease" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <Zap size={13} /> Create automation
      </button>
      <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 12 }}>Under 2 minutes · No coding required</p>
    </div>
  );
}