"use client";

import { Plus, Trash2, Lock } from "lucide-react";

interface DripStep {
  stepNumber:  number;
  delayHours:  number;
  message:     string;
}

interface Step4DripProps {
  dripEnabled: boolean;
  steps:       DripStep[];
  stopOnReply: boolean;
  plan:        string;
  submitting:  boolean;
  onToggle:    (v: boolean) => void;
  onSteps:     (v: DripStep[]) => void;
  onStopOnReply: (v: boolean) => void;
  onBack:      () => void;
  onSubmit:    () => void;
}

const DELAY_OPTIONS = [
  { label: "1 hour",   value: 1   },
  { label: "3 hours",  value: 3   },
  { label: "6 hours",  value: 6   },
  { label: "12 hours", value: 12  },
  { label: "24 hours", value: 24  },
  { label: "48 hours", value: 48  },
  { label: "72 hours", value: 72  },
];

export function Step4Drip({
  dripEnabled, steps, stopOnReply, plan, submitting,
  onToggle, onSteps, onStopOnReply, onBack, onSubmit,
}: Step4DripProps) {
  const dripLocked = plan === "starter";

  function addStep() {
    if (steps.length >= 5) return;
    onSteps([...steps, { stepNumber: steps.length + 1, delayHours: 24, message: "" }]);
  }

  function updateStep(i: number, field: keyof DripStep, val: string | number) {
    const updated = [...steps];
    updated[i] = { ...updated[i], [field]: val } as DripStep;
    onSteps(updated);
  }

  function removeStep(i: number) {
    onSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  }

  const canSubmit = !dripEnabled || steps.every((s) => s.message.trim().length > 0);

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, color: "var(--ink-1)", letterSpacing: "-0.02em", marginBottom: 6 }}>
        Add follow-up drip
      </h2>
      <p style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)", marginBottom: 28 }}>
        Optional: automatically follow up with leads who don't respond.
      </p>

      {/* Toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 10, border: "1px solid var(--rule-md)", background: "var(--bg-card)", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-1)", marginBottom: 3 }}>Enable drip follow-up</p>
          <p style={{ fontSize: 12, fontWeight: 300, color: "var(--ink-3)" }}>
            {dripLocked ? "Requires Creator plan or above" : "Send timed follow-ups to cold leads automatically"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {dripLocked && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--yellow-muted)", border: "1px solid var(--yellow-border)", borderRadius: 99, padding: "3px 9px" }}>
              <Lock size={9} color="var(--yellow)" />
              <span style={{ fontSize: 10, fontWeight: 500, color: "var(--yellow)" }}>Creator+</span>
            </div>
          )}
          <button
            onClick={() => !dripLocked && onToggle(!dripEnabled)}
            disabled={dripLocked}
            style={{ width: 40, height: 22, borderRadius: 99, border: "none", cursor: dripLocked ? "not-allowed" : "pointer", background: dripEnabled && !dripLocked ? "var(--accent)" : "var(--rule-md)", position: "relative", transition: "background 0.2s ease" }}
          >
            <span style={{ position: "absolute", top: 3, left: dripEnabled && !dripLocked ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left 0.2s cubic-bezier(0.16,1,0.36,1)" }} />
          </button>
        </div>
      </div>

      {/* Drip steps */}
      {dripEnabled && !dripLocked && (
        <div style={{ marginBottom: 24 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
              {/* Step number + delay */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", paddingTop: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--accent)" }}>
                  {step.stepNumber}
                </div>
                {i < steps.length - 1 && <div style={{ width: 1, height: 20, background: "var(--rule-md)" }} />}
              </div>

              {/* Message + delay selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <select
                    value={step.delayHours}
                    onChange={(e) => updateStep(i, "delayHours", Number(e.target.value))}
                    style={{ height: 32, borderRadius: 7, border: "1px solid var(--rule-md)", background: "var(--bg-card)", color: "var(--ink-2)", fontSize: 12, fontFamily: "var(--font-sans)", padding: "0 8px", outline: "none", cursor: "pointer" }}
                  >
                    {DELAY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label} after trigger</option>
                    ))}
                  </select>
                  {step.delayHours >= 24 && (
                    <span style={{ fontSize: 10, color: "var(--yellow)", background: "var(--yellow-muted)", border: "1px solid var(--yellow-border)", borderRadius: 99, padding: "2px 7px", whiteSpace: "nowrap" }}>
                      Uses template message (₹0.13/msg)
                    </span>
                  )}
                </div>
                <textarea
                  value={step.message}
                  onChange={(e) => updateStep(i, "message", e.target.value)}
                  placeholder={`Follow-up message ${step.stepNumber}…`}
                  rows={2}
                  style={{ width: "100%", borderRadius: 8, border: "1px solid var(--rule-md)", background: "var(--bg-card)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "8px 12px", outline: "none", resize: "vertical", lineHeight: 1.55 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
                />
              </div>

              {/* Remove */}
              <button onClick={() => removeStep(i)} style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid var(--rule)", background: "none", cursor: "pointer", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {steps.length < 5 && (
            <button onClick={addStep} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: 7, padding: "7px 14px", cursor: "pointer", marginBottom: 16 }}>
              <Plus size={12} /> Add step {steps.length + 1}
            </button>
          )}

          {/* Stop on reply */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 8, background: "var(--bg-subtle)", border: "1px solid var(--rule)" }}>
            <input type="checkbox" id="stop-reply" checked={stopOnReply} onChange={(e) => onStopOnReply(e.target.checked)} style={{ accentColor: "var(--accent)", width: 14, height: 14, cursor: "pointer" }} />
            <label htmlFor="stop-reply" style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-2)", cursor: "pointer", lineHeight: 1.4 }}>
              Stop drip when lead replies <span style={{ color: "var(--ink-3)", fontSize: 12 }}>(recommended — prevents over-messaging engaged leads)</span>
            </label>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", color: "var(--ink-3)", border: "1px solid var(--rule-md)", cursor: "pointer", fontSize: 13 }}>
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 8, background: canSubmit && !submitting ? "var(--accent)" : "var(--rule)", color: canSubmit && !submitting ? "#fff" : "var(--ink-3)", border: "none", cursor: canSubmit && !submitting ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 400 }}
        >
          {submitting ? "Creating…" : "🚀 Go Live"}
        </button>
      </div>
    </div>
  );
}