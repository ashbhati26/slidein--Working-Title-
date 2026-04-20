"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { NavButtons } from "./nav-buttons";
import type { TriggerType } from "./step1-trigger";

type MatchType = "exact" | "contains" | "fuzzy";

interface Step3KeywordProps {
  name: string; keywords: string[]; matchType: MatchType;
  plan: string; triggerType: TriggerType;
  onName: (v: string) => void; onKeywords: (v: string[]) => void;
  onMatchType: (v: MatchType) => void; onBack: () => void; onNext: () => void;
}

const MATCH_OPTIONS = [
  { v: "exact"    as MatchType, l: "Exact",    d: "Must be exactly the keyword"    },
  { v: "contains" as MatchType, l: "Contains", d: "Must contain the keyword"       },
  { v: "fuzzy"    as MatchType, l: "Fuzzy",    d: "Catches Hinglish typos too"     },
];

export function Step3Keyword({ name, keywords, matchType, plan, triggerType, onName, onKeywords, onMatchType, onBack, onNext }: Step3KeywordProps) {
  const [input, setInput] = useState("");
  const isPaid     = plan !== "starter";
  const canAddMore = isPaid || keywords.length < 1;
  const canNext    = name.trim().length > 0 && keywords.length > 0;

  function add() {
    const kw = input.trim().toUpperCase();
    if (!kw || keywords.includes(kw)) return;
    onKeywords([...keywords, kw]);
    setInput("");
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 20, lineHeight: 1.6, letterSpacing: "-0.005em" }}>
        {triggerType === "ig_comment"
          ? "When someone comments this keyword on your post, SlideIN sends them a DM instantly."
          : "When someone sends this keyword, SlideIN replies instantly."}
      </p>

      <div style={{ marginBottom: 18 }}>
        <label style={labelSt}>Automation name</label>
        <input value={name} onChange={(e) => onName(e.target.value)} placeholder="e.g. Fitness program enquiry" style={inputSt}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
        />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelSt}>
          Trigger keyword{isPaid ? "s" : ""}{" "}
          <span style={{ fontWeight: 400, textTransform: "none" }}>(press Enter to add)</span>
        </label>
        {keywords.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
            {keywords.map((kw) => (
              <span key={kw} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 99, background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "monospace", letterSpacing: "0.04em" }}>
                {kw}
                <button onClick={() => onKeywords(keywords.filter((k) => k !== kw))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", display: "flex", padding: 0, opacity: 0.6 }}>
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 7 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="e.g. PRICE, FIT, COURSE" disabled={!canAddMore}
            style={{ ...inputSt, flex: 1, opacity: canAddMore ? 1 : 0.5 }}
            onFocus={(e) => canAddMore && (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
          />
          <button onClick={add} disabled={!input.trim() || !canAddMore}
            style={{ height: 36, padding: "0 12px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", opacity: !input.trim() || !canAddMore ? 0.4 : 1 }}>
            <Plus size={13} />
          </button>
        </div>
        {!isPaid && <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 5 }}>Free plan: 1 keyword. Upgrade to Creator for multiple keywords + fuzzy matching.</p>}
      </div>

      {isPaid && (
        <div style={{ marginBottom: 4 }}>
          <label style={labelSt}>Match type</label>
          <div style={{ display: "flex", gap: 7 }}>
            {MATCH_OPTIONS.map((opt) => (
              <button key={opt.v} onClick={() => onMatchType(opt.v)} style={{
                flex: 1, padding: "9px 10px", borderRadius: 9, textAlign: "left", cursor: "pointer",
                border: `1px solid ${matchType === opt.v ? "var(--accent)" : "var(--rule-md)"}`,
                background: matchType === opt.v ? "var(--accent-muted)" : "var(--bg)",
                transition: "all 0.12s ease",
              }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: matchType === opt.v ? "var(--accent)" : "var(--ink-1)", marginBottom: 2 }}>{opt.l}</p>
                <p style={{ fontSize: 10, color: "var(--ink-3)", lineHeight: 1.4 }}>{opt.d}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canNext} />
    </div>
  );
}

const labelSt: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "-0.005em", marginBottom: 6 };
const inputSt: React.CSSProperties = { width: "100%", height: 36, borderRadius: 8, border: "0.5px solid var(--rule-md)", background: "var(--bg-subtle)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "0 12px", outline: "none", transition: "border-color 0.12s ease", boxSizing: "border-box" as const };