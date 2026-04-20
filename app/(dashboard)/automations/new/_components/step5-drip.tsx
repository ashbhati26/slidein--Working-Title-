"use client";

import { ArrowLeft, Loader2, Plus, Trash2, Zap } from "lucide-react";

export interface DripStep { stepNumber: number; delayHours: number; message: string; }

interface Step5DripProps {
  enabled: boolean; steps: DripStep[]; stopOnReply: boolean;
  plan: string; submitting: boolean;
  onToggle: (v: boolean) => void; onSteps: (v: DripStep[]) => void;
  onStopOnReply: (v: boolean) => void; onBack: () => void; onSubmit: () => void;
}

const DELAYS = [1, 3, 6, 12, 24, 48, 72].map((v) => ({ value: v, label: v === 1 ? "1 hour" : v < 24 ? `${v} hours` : `${v/24} day${v/24 > 1 ? "s" : ""}` }));

export function Step5Drip({ enabled, steps, stopOnReply, plan, submitting, onToggle, onSteps, onStopOnReply, onBack, onSubmit }: Step5DripProps) {
  const locked    = plan === "starter";
  const canSubmit = !enabled || steps.every((s) => s.message.trim().length > 0);

  function add() { if (steps.length >= 5) return; onSteps([...steps, { stepNumber: steps.length + 1, delayHours: 24, message: "" }]); }
  function update(i: number, field: keyof DripStep, val: string | number) { const u = [...steps]; u[i] = { ...u[i], [field]: val } as DripStep; onSteps(u); }
  function remove(i: number) { onSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 }))); }

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 20, lineHeight: 1.6, letterSpacing: "-0.005em" }}>
        Optional: automatically follow up with leads who don't reply. Drip stops the moment they respond.
      </p>

      {/* Toggle row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, border: "0.5px solid var(--rule-md)", background: "var(--bg-subtle)", marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", marginBottom: 2, letterSpacing: "-0.01em" }}>Enable drip follow-up</p>
          <p style={{ fontSize: 11, color: "var(--ink-3)" }}>{locked ? "Requires Creator plan or above" : "Up to 5 timed follow-up messages"}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {locked && <span style={{ fontSize: 9, fontWeight: 600, color: "var(--yellow)", background: "var(--yellow-muted)", border: "0.5px solid var(--yellow-border)", borderRadius: 99, padding: "2px 7px" }}>Creator+</span>}
          <button onClick={() => !locked && onToggle(!enabled)} disabled={locked} style={{ width: 40, height: 22, borderRadius: 99, border: "none", cursor: locked ? "not-allowed" : "pointer", background: enabled && !locked ? "var(--accent)" : "var(--rule-md)", position: "relative", transition: "background 0.2s ease", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 2, left: enabled && !locked ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left 0.2s cubic-bezier(0.16,1,0.36,1)" }} />
          </button>
        </div>
      </div>

      {/* Steps */}
      {enabled && !locked && (
        <div style={{ marginBottom: 20 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 9, flexShrink: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--accent)" }}>
                  {step.stepNumber}
                </div>
                {i < steps.length - 1 && <div style={{ width: 1, height: 16, background: "var(--rule-md)", marginTop: 3 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <select value={step.delayHours} onChange={(e) => update(i, "delayHours", Number(e.target.value))}
                    style={{ height: 30, borderRadius: 7, border: "0.5px solid var(--rule-md)", background: "var(--bg)", color: "var(--ink-2)", fontSize: 11, fontFamily: "var(--font-sans)", padding: "0 8px", outline: "none", cursor: "pointer" }}>
                    {DELAYS.map((d) => <option key={d.value} value={d.value}>{d.label} after trigger</option>)}
                  </select>
                  {step.delayHours >= 24 && (
                    <span style={{ fontSize: 9, color: "var(--yellow)", background: "var(--yellow-muted)", border: "0.5px solid var(--yellow-border)", borderRadius: 99, padding: "2px 7px", whiteSpace: "nowrap" }}>₹0.13/msg outside 24h</span>
                  )}
                </div>
                <textarea value={step.message} onChange={(e) => update(i, "message", e.target.value)} placeholder={`Follow-up message ${step.stepNumber}…`} rows={2}
                  style={{ width: "100%", borderRadius: 8, border: "0.5px solid var(--rule-md)", background: "var(--bg-subtle)", color: "var(--ink-1)", fontSize: 12, fontFamily: "var(--font-sans)", padding: "8px 11px", outline: "none", resize: "vertical", lineHeight: 1.55, boxSizing: "border-box" as const }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
                />
              </div>
              <button onClick={() => remove(i)} style={{ width: 30, height: 30, borderRadius: 7, border: "0.5px solid var(--rule)", background: "none", cursor: "pointer", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 9, flexShrink: 0 }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {steps.length < 5 && (
            <button onClick={add} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 400, color: "var(--accent)", background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", borderRadius: 8, padding: "7px 12px", cursor: "pointer", marginBottom: 14 }}>
              <Plus size={12} /> Add step {steps.length + 1}
            </button>
          )}

          <label style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "11px 13px", borderRadius: 8, background: "var(--bg-subtle)", border: "0.5px solid var(--rule)", cursor: "pointer" }}>
            <input type="checkbox" checked={stopOnReply} onChange={(e) => onStopOnReply(e.target.checked)} style={{ accentColor: "var(--accent)", width: 14, height: 14, marginTop: 1, flexShrink: 0, cursor: "pointer" }} />
            <span style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>
              Stop drip when lead replies{" "}
              <span style={{ color: "var(--ink-3)", fontSize: 11 }}>— prevents messaging someone already in conversation (recommended)</span>
            </span>
          </label>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "0.5px solid var(--rule)" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, height: 34, padding: "0 14px", borderRadius: 980, background: "transparent", color: "var(--ink-3)", border: "0.5px solid var(--rule-md)", cursor: "pointer", fontSize: 12 }}>
          <ArrowLeft size={13} /> Back
        </button>
        <button onClick={onSubmit} disabled={!canSubmit || submitting} style={{ display: "flex", alignItems: "center", gap: 7, height: 36, padding: "0 22px", borderRadius: 980, background: canSubmit && !submitting ? "var(--accent)" : "var(--rule-md)", color: canSubmit && !submitting ? "#fff" : "var(--ink-3)", border: "none", cursor: canSubmit && !submitting ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em", transition: "all 0.15s ease" }}>
          {submitting ? <><Loader2 size={13} style={{ animation: "spin .7s linear infinite" }} /> Creating…</> : <><Zap size={13} /> Go Live</>}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}