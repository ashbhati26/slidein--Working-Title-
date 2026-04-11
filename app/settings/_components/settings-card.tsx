interface SettingsCardProps {
  title:        string;
  description?: string;
  children:     React.ReactNode;
  style?:       React.CSSProperties;
}

export function SettingsCard({ title, description, children, style = {} }: SettingsCardProps) {
  return (
    <div style={{
      background: "var(--bg)",
      border: "0.5px solid var(--rule-md)",
      borderRadius: 18,
      overflow: "hidden",
      ...style,
    }}>
      <div style={{
        padding: "14px 20px",
        borderBottom: "0.5px solid var(--rule)",
      }}>
        <p style={{
          fontSize: 14, fontWeight: 500,
          color: "var(--ink-1)", letterSpacing: "-0.01em",
          marginBottom: description ? 2 : 0,
        }}>
          {title}
        </p>
        {description && (
          <p className="t-caption">{description}</p>
        )}
      </div>
      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}

/* ── Shared form primitives — exported for reuse ─────────── */
export const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: 11, fontWeight: 600,
  color: "var(--ink-3)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 6,
};

export const inputSt: React.CSSProperties = {
  width: "100%", height: 40,
  borderRadius: 980,
  border: "0.5px solid var(--rule-md)",
  background: "var(--bg-subtle)",
  color: "var(--ink-1)",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
  padding: "0 14px",
  outline: "none",
  transition: "border-color 0.12s ease",
  letterSpacing: "-0.01em",
};