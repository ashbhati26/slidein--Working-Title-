interface StatCardProps {
  label:   string;
  value:   string | number;
  sub?:    string;
  accent?: boolean;
  color?:  string;
}

export function StatCard({ label, value, sub, accent, color }: StatCardProps) {
  return (
    <div style={{
      background:    accent ? "var(--accent)" : "var(--bg)",
      border:        `0.5px solid ${accent ? "transparent" : "var(--rule-md)"}`,
      borderRadius:  14,
      padding:       "18px 20px",
      display:       "flex",
      flexDirection: "column",
      gap:           4,
    }}>
      <p style={{
        fontSize: 11, fontWeight: 500,
        color: accent ? "rgba(255,255,255,0.6)" : "var(--ink-3)",
        letterSpacing: "-0.005em",
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 26, fontWeight: 600,
        color: accent ? "#fff" : color ?? "var(--ink-1)",
        letterSpacing: "-0.04em", lineHeight: 1,
        fontFamily: "var(--font-sans)",
      }}>
        {value}
      </p>
      {sub && (
        <p style={{
          fontSize: 11,
          color: accent ? "rgba(255,255,255,0.5)" : "var(--ink-3)",
          letterSpacing: "-0.005em",
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}