"use client";

import { Phone, Lock, Camera } from "lucide-react";

interface Step1ChannelProps {
  channel:    "instagram" | "whatsapp" | undefined;
  plan:       string;
  onSelect:   (c: "instagram" | "whatsapp") => void;
  onNext:     () => void;
}

export function Step1Channel({ channel, plan, onSelect, onNext }: Step1ChannelProps) {
  const waLocked = plan === "starter";

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, color: "var(--ink-1)", letterSpacing: "-0.02em", marginBottom: 6 }}>
        Choose a channel
      </h2>
      <p style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)", marginBottom: 28 }}>
        Where do you want to capture leads?
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        {/* Instagram */}
        <button
          onClick={() => onSelect("instagram")}
          style={{
            padding: "24px 20px", borderRadius: 12, textAlign: "left", cursor: "pointer",
            border: `2px solid ${channel === "instagram" ? "var(--accent)" : "var(--rule-md)"}`,
            background: channel === "instagram" ? "var(--accent-muted)" : "var(--bg-card)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { if (channel !== "instagram") e.currentTarget.style.borderColor = "var(--ink-3)"; }}
          onMouseLeave={(e) => { if (channel !== "instagram") e.currentTarget.style.borderColor = "var(--rule-md)"; }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(225,48,108,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Camera size={20} color="#E1306C" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-1)", marginBottom: 4 }}>Instagram</p>
          <p style={{ fontSize: 12, fontWeight: 300, color: "var(--ink-3)", lineHeight: 1.55 }}>
            Automate DMs and comment replies on your posts and reels.
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Comment → DM", "DM keyword"].map((tag) => (
              <span key={tag} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: "var(--bg-subtle)", border: "1px solid var(--rule)", color: "var(--ink-3)" }}>{tag}</span>
            ))}
          </div>
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => !waLocked && onSelect("whatsapp")}
          style={{
            padding: "24px 20px", borderRadius: 12, textAlign: "left",
            cursor: waLocked ? "not-allowed" : "pointer",
            border: `2px solid ${channel === "whatsapp" ? "var(--accent)" : "var(--rule-md)"}`,
            background: channel === "whatsapp" ? "var(--accent-muted)" : waLocked ? "var(--bg-subtle)" : "var(--bg-card)",
            opacity: waLocked ? 0.6 : 1,
            transition: "all 0.15s ease",
            position: "relative",
          }}
          onMouseEnter={(e) => { if (channel !== "whatsapp" && !waLocked) e.currentTarget.style.borderColor = "var(--ink-3)"; }}
          onMouseLeave={(e) => { if (channel !== "whatsapp" && !waLocked) e.currentTarget.style.borderColor = "var(--rule-md)"; }}
        >
          {waLocked && (
            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, background: "var(--yellow-muted)", border: "1px solid var(--yellow-border)", borderRadius: 99, padding: "2px 8px" }}>
              <Lock size={9} color="var(--yellow)" />
              <span style={{ fontSize: 9, fontWeight: 500, color: "var(--yellow)" }}>Creator+</span>
            </div>
          )}
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(37,211,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Phone size={20} color="#25D366" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-1)", marginBottom: 4 }}>WhatsApp</p>
          <p style={{ fontSize: 12, fontWeight: 300, color: "var(--ink-3)", lineHeight: 1.55 }}>
            Respond to WhatsApp messages automatically on your business number.
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Keyword trigger", "AI replies", "Drip"].map((tag) => (
              <span key={tag} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: "var(--bg-subtle)", border: "1px solid var(--rule)", color: "var(--ink-3)" }}>{tag}</span>
            ))}
          </div>
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onNext}
          disabled={!channel}
          style={{ padding: "10px 24px", borderRadius: 8, background: channel ? "var(--accent)" : "var(--rule)", color: channel ? "#fff" : "var(--ink-3)", border: "none", cursor: channel ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 400, transition: "all 0.15s ease" }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}