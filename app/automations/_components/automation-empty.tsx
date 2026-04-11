import { Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function AutomationEmpty() {
  const router = useRouter();
  return (
    <div style={{
      padding: "72px 24px",
      display: "flex", flexDirection: "column",
      alignItems: "center", textAlign: "center",
    }}>
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: "var(--accent-muted)",
        border: "1px solid var(--accent-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18,
      }}>
        <Zap size={22} color="var(--accent)" fill="var(--accent)" />
      </div>

      <h2 style={{
        fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400,
        color: "var(--ink-1)", letterSpacing: "-0.02em", marginBottom: 8,
      }}>
        No automations yet
      </h2>
      <p style={{
        fontSize: 13, fontWeight: 300, color: "var(--ink-3)",
        maxWidth: 320, lineHeight: 1.65, marginBottom: 28,
      }}>
        Create your first automation and start capturing leads from Instagram comments or WhatsApp messages automatically.
      </p>

      <button
        onClick={() => router.push("/automations/new")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "10px 20px", borderRadius: 8,
          background: "var(--accent)", color: "#fff",
          border: "none", cursor: "pointer", fontSize: 13, fontWeight: 400,
          transition: "opacity 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Create automation <ArrowRight size={13} />
      </button>

      <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 14 }}>
        Takes under 2 minutes · No coding required
      </p>
    </div>
  );
}