import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label:   string;
  value:   string | number;
  sub?:    string;
  icon?:   LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, sub, icon: Icon, accent }: StatCardProps) {
  return (
    <div style={{
      padding: "20px 20px 18px",
      background: accent ? "var(--accent)" : "var(--bg)",
      border: accent ? "none" : "0.5px solid var(--rule-md)",
      borderRadius: 18,
    }}>
      {/* Label row */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 16,
      }}>
        <span className="t-body-sm" style={{ color: accent ? "rgba(255,255,255,0.6)" : undefined }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: accent ? "rgba(255,255,255,0.14)" : "var(--bg-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={14} color={accent ? "rgba(255,255,255,0.85)" : "var(--ink-3)"} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="t-stat" style={{
        fontSize: "clamp(28px, 3vw, 36px)",
        color: accent ? "var(--ink-inv)" : "var(--ink-1)",
        marginBottom: sub ? 6 : 0,
      }}>
        {value}
      </div>

      {sub && (
        <p className="t-body-sm" style={{ color: accent ? "rgba(255,255,255,0.5)" : undefined }}>
          {sub}
        </p>
      )}
    </div>
  );
}