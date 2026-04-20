interface ChannelRowProps {
  label:     string;
  icon:      React.ElementType;
  iconColor: string;
  connected: boolean;
  onConnect: () => void;
}

export function ChannelRow({ label, icon: Icon, iconColor, connected, onConnect }: ChannelRowProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: connected ? `${iconColor}10` : "var(--bg-subtle)",
          border: `0.5px solid ${connected ? `${iconColor}25` : "var(--rule-md)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={15} color={connected ? iconColor : "var(--ink-3)"} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", marginBottom: 1, letterSpacing: "-0.01em" }}>
            {label}
          </p>
          <p style={{ fontSize: 11, color: connected ? "var(--accent)" : "var(--ink-3)" }}>
            {connected ? "Connected" : "Not connected"}
          </p>
        </div>
      </div>

      {connected ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 980,
          background: "var(--accent-muted)",
          border: "0.5px solid var(--accent-border)",
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)" }}>Active</span>
        </div>
      ) : (
        <button
          onClick={onConnect}
          style={{
            height: 28, padding: "0 12px", fontSize: 12, fontWeight: 400,
            color: "var(--ink-2)", background: "var(--bg)",
            border: "0.5px solid var(--rule-md)", borderRadius: 980,
            cursor: "pointer", letterSpacing: "-0.01em",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--ink-3)";
            e.currentTarget.style.color = "var(--ink-1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--rule-md)";
            e.currentTarget.style.color = "var(--ink-2)";
          }}
        >
          Connect
        </button>
      )}
    </div>
  );
}