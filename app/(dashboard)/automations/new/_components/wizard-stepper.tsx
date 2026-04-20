import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Trigger" },
  { id: 2, label: "Post"    },
  { id: 3, label: "Keyword" },
  { id: 4, label: "Reply"   },
  { id: 5, label: "Drip"    },
];

export function WizardStepper({ currentStep, maxStep }: { currentStep: number; maxStep: number }) {
  const visible = STEPS.filter((s) => s.id <= maxStep);
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {visible.map((s, i) => {
        const done   = s.id < currentStep;
        const active = s.id === currentStep;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < visible.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600,
                background: done ? "var(--accent)" : active ? "var(--ink-1)" : "var(--bg-subtle)",
                color: done || active ? "#fff" : "var(--ink-3)",
                border: !done && !active ? "0.5px solid var(--rule-md)" : "none",
                transition: "all 0.2s ease",
              }}>
                {done ? <Check size={12} /> : s.id}
              </div>
              <span style={{
                fontSize: 9, fontWeight: active ? 600 : 400,
                color: active ? "var(--ink-1)" : done ? "var(--accent)" : "var(--ink-3)",
                letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap",
              }}>
                {s.label}
              </span>
            </div>
            {i < visible.length - 1 && (
              <div style={{ flex: 1, height: 1, margin: "0 6px", marginBottom: 18, background: done ? "var(--accent)" : "var(--rule-md)", transition: "background 0.3s ease" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}