import { ArrowRight } from "lucide-react";

interface QuickActionProps {
  label:   string;
  sub:     string;
  icon:    React.ElementType;
  onClick: () => void;
  isLast?: boolean;
}

export function QuickAction({ label, sub, icon: Icon, onClick, isLast }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", padding: "13px 18px",
        background: "transparent", border: "none",
        borderBottom: isLast ? "none" : "0.5px solid var(--rule)",
        cursor: "pointer", textAlign: "left",
        transition: "background 0.1s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "var(--bg-subtle)",
        border: "0.5px solid var(--rule-md)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={14} color="var(--ink-3)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em", marginBottom: 1 }}>
          {label}
        </p>
        <p style={{ fontSize: 11, color: "var(--ink-3)" }}>{sub}</p>
      </div>
      <ArrowRight size={13} color="var(--ink-3)" style={{ flexShrink: 0 }} />
    </button>
  );
}