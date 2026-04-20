interface SettingsCardProps {
  title:        string;
  description?: string;
  children:     React.ReactNode;
  style?:       React.CSSProperties;
}

export function SettingsCard({ title, description, children, style = {} }: SettingsCardProps) {
  return (
    <div style={{
      background:   "var(--bg)",
      border:       "0.5px solid var(--rule-md)",
      borderRadius: 14,
      overflow:     "hidden",
      ...style,
    }}>
      <div style={{ padding: "13px 18px", borderBottom: "0.5px solid var(--rule)" }}>
        <p style={{
          fontSize: 13, fontWeight: 500,
          color: "var(--ink-1)", letterSpacing: "-0.01em",
          marginBottom: description ? 2 : 0,
        }}>
          {title}
        </p>
        {description && (
          <p style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ padding: "18px" }}>
        {children}
      </div>
    </div>
  );
}

export const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: 11, fontWeight: 500,
  color: "var(--ink-3)",
  letterSpacing: "-0.005em",
  marginBottom: 5,
};

export const inputSt: React.CSSProperties = {
  width: "100%", height: 36,
  borderRadius: 8,
  border: "0.5px solid var(--rule-md)",
  background: "var(--bg-subtle)",
  color: "var(--ink-1)",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
  padding: "0 12px",
  outline: "none",
  transition: "border-color 0.12s ease",
  letterSpacing: "-0.01em",
  boxSizing: "border-box" as const,
};