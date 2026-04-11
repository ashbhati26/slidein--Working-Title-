"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface Step2KeywordProps {
  channel:    "instagram" | "whatsapp";
  name:       string;
  keywords:   string[];
  matchType:  "exact" | "contains" | "fuzzy";
  plan:       string;
  onName:     (v: string) => void;
  onKeywords: (v: string[]) => void;
  onMatch:    (v: "exact" | "contains" | "fuzzy") => void;
  onBack:     () => void;
  onNext:     () => void;
}

export function Step2Keyword({
  channel, name, keywords, matchType, plan,
  onName, onKeywords, onMatch, onBack, onNext,
}: Step2KeywordProps) {
  const [input, setInput] = useState("");
  const isPaid = plan !== "starter";

  function addKeyword() {
    const kw = input.trim().toUpperCase();
    if (!kw || keywords.includes(kw)) return;
    onKeywords([...keywords, kw]);
    setInput("");
  }

  function removeKeyword(kw: string) {
    onKeywords(keywords.filter((k) => k !== kw));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); addKeyword(); }
  }

  const canNext = name.trim().length > 0 && keywords.length > 0;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, color: "var(--ink-1)", letterSpacing: "-0.02em", marginBottom: 6 }}>
        Set your trigger
      </h2>
      <p style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)", marginBottom: 28 }}>
        What keyword should activate this automation on {channel === "instagram" ? "Instagram" : "WhatsApp"}?
      </p>

      {/* Name */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Automation name
        </label>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="e.g. Fitness program enquiry"
          style={{ width: "100%", height: 40, borderRadius: 8, border: "1px solid var(--rule-md)", background: "var(--bg-card)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "0 12px", outline: "none", transition: "border-color 0.12s ease" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
        />
      </div>

      {/* Keywords */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Keywords <span style={{ color: "var(--ink-3)", fontWeight: 300, textTransform: "none" }}>(press Enter to add)</span>
        </label>

        {/* Tag display */}
        {keywords.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {keywords.map((kw) => (
              <span key={kw} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "var(--accent-muted)", border: "1px solid var(--accent-border)", fontSize: 12, fontWeight: 500, color: "var(--accent)", fontFamily: "monospace" }}>
                {kw}
                <button onClick={() => removeKeyword(kw)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", display: "flex", padding: 0, opacity: 0.6 }}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. PRICE, FIT, COURSE"
            disabled={!isPaid && keywords.length >= 1}
            style={{ flex: 1, height: 40, borderRadius: 8, border: "1px solid var(--rule-md)", background: "var(--bg-card)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "0 12px", outline: "none", transition: "border-color 0.12s ease", opacity: !isPaid && keywords.length >= 1 ? 0.5 : 1 }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
          />
          <button onClick={addKeyword} disabled={!input.trim()} style={{ height: 40, padding: "0 14px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 13, opacity: !input.trim() ? 0.5 : 1 }}>
            <Plus size={13} /> Add
          </button>
        </div>

        {!isPaid && (
          <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
            Free plan: 1 keyword per automation. Upgrade to Creator for multiple keywords + fuzzy matching.
          </p>
        )}
      </div>

      {/* Match type — paid only */}
      {isPaid && (
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Match type
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {([
              { value: "exact",    label: "Exact",    desc: "Message must be exactly the keyword" },
              { value: "contains", label: "Contains", desc: "Message must contain the keyword"    },
              { value: "fuzzy",    label: "Fuzzy",    desc: "Catches typos and Hinglish variants" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => onMatch(opt.value)}
                style={{ flex: 1, padding: "10px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer", border: `1.5px solid ${matchType === opt.value ? "var(--accent)" : "var(--rule-md)"}`, background: matchType === opt.value ? "var(--accent-muted)" : "var(--bg-card)", transition: "all 0.12s ease" }}
              >
                <p style={{ fontSize: 12, fontWeight: 500, color: matchType === opt.value ? "var(--accent)" : "var(--ink-1)", marginBottom: 3 }}>{opt.label}</p>
                <p style={{ fontSize: 11, fontWeight: 300, color: "var(--ink-3)", lineHeight: 1.4 }}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", color: "var(--ink-3)", border: "1px solid var(--rule-md)", cursor: "pointer", fontSize: 13 }}>
          ← Back
        </button>
        <button onClick={onNext} disabled={!canNext} style={{ padding: "10px 24px", borderRadius: 8, background: canNext ? "var(--accent)" : "var(--rule)", color: canNext ? "#fff" : "var(--ink-3)", border: "none", cursor: canNext ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 400 }}>
          Continue →
        </button>
      </div>
    </div>
  );
}