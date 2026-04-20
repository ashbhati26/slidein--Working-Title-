export function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--bg)",
      border: "0.5px solid var(--rule-md)",
      borderRadius: 16,
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "0.5px solid var(--rule)",
    }}>
      <span style={{
        fontSize: 13, fontWeight: 500,
        color: "var(--ink-1)", letterSpacing: "-0.01em",
      }}>
        {title}
      </span>
      {action}
    </div>
  );
}