type LeadStatus = "new" | "in_conversation" | "qualified" | "converted" | "opted_out" | "lost";

const CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  new:             { label: "New",             color: "var(--accent)",  bg: "var(--accent-muted)",  border: "var(--accent-border)"  },
  in_conversation: { label: "Talking",         color: "#a78bfa",        bg: "rgba(167,139,250,.1)", border: "rgba(167,139,250,.25)" },
  qualified:       { label: "Qualified",       color: "var(--green)",   bg: "var(--green-muted)",   border: "var(--green-border)"   },
  converted:       { label: "Converted",       color: "var(--green)",   bg: "var(--green-muted)",   border: "var(--green-border)"   },
  opted_out:       { label: "Opted out",       color: "var(--ink-3)",   bg: "var(--rule)",          border: "var(--rule-md)"        },
  lost:            { label: "Lost",            color: "var(--red)",     bg: "var(--red-muted)",     border: "var(--red-border)"     },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const c = CONFIG[status];
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      color: c.color, background: c.bg,
      border: `0.5px solid ${c.border}`,
      borderRadius: 99, padding: "2px 8px",
      whiteSpace: "nowrap", letterSpacing: "0.01em",
    }}>
      {c.label}
    </span>
  );
}