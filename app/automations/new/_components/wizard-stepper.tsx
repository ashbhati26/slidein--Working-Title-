interface WizardStepperProps {
  currentStep: number;
  steps: { label: string }[];
}

export function WizardStepper({ currentStep, steps }: WizardStepperProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((step, i) => {
        const num      = i + 1;
        const done     = num < currentStep;
        const active   = num === currentStep;
        const upcoming = num > currentStep;

        return (
          <div key={step.label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            {/* Circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 500,
                background: done ? "var(--accent)" : active ? "var(--ink-1)" : "var(--bg-subtle)",
                color: done || active ? "#fff" : "var(--ink-3)",
                border: upcoming ? "1px solid var(--rule-md)" : "none",
                transition: "all 0.2s ease",
              }}>
                {done ? "✓" : num}
              </div>
              <span style={{
                fontSize: 10, fontWeight: active ? 500 : 400,
                color: active ? "var(--ink-1)" : done ? "var(--accent)" : "var(--ink-3)",
                letterSpacing: "0.02em", whiteSpace: "nowrap",
              }}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1, margin: "0 8px",
                marginBottom: 22,
                background: done ? "var(--accent)" : "var(--rule-md)",
                transition: "background 0.3s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}