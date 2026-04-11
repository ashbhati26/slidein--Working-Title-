"use client";

import { useState } from "react";
import { Bot, MessageSquare, Lock, Plus, Trash2 } from "lucide-react";

const LANGUAGES = [
  { value: "hinglish", label: "Hinglish", desc: "Hindi + English mix (recommended)" },
  { value: "hindi",    label: "Hindi",    desc: "Pure Hindi — Devanagari script"    },
  { value: "english",  label: "English",  desc: "Standard English"                  },
  { value: "tamil",    label: "Tamil",    desc: "Tamil script"                      },
  { value: "telugu",   label: "Telugu",   desc: "Telugu script"                     },
  { value: "marathi",  label: "Marathi",  desc: "Marathi script"                    },
] as const;

type Language = (typeof LANGUAGES)[number]["value"];

interface AiConfig {
  language:            Language;
  tone:                string;
  businessDescription: string;
  faqs:                { question: string; answer: string }[];
  paymentLink?:        string;
  escalationPhrase?:   string;
}

interface Step3ActionProps {
  listenerType:  "fixed_message" | "smart_ai";
  message:       string;
  aiConfig:      AiConfig;
  plan:          string;
  onType:        (t: "fixed_message" | "smart_ai") => void;
  onMessage:     (v: string) => void;
  onAiConfig:    (v: Partial<AiConfig>) => void;
  onBack:        () => void;
  onNext:        () => void;
}

export function Step3Action({
  listenerType, message, aiConfig, plan,
  onType, onMessage, onAiConfig, onBack, onNext,
}: Step3ActionProps) {
  const aiLocked = plan !== "smart_ai";

  const canNext =
    listenerType === "fixed_message"
      ? message.trim().length > 0
      : aiConfig.businessDescription.trim().length > 0 && aiConfig.tone.trim().length > 0;

  function addFaq() {
    onAiConfig({ faqs: [...aiConfig.faqs, { question: "", answer: "" }] });
  }

  function updateFaq(i: number, field: "question" | "answer", val: string) {
    const updated = [...aiConfig.faqs];
    updated[i] = { ...updated[i], [field]: val };
    onAiConfig({ faqs: updated });
  }

  function removeFaq(i: number) {
    onAiConfig({ faqs: aiConfig.faqs.filter((_, idx) => idx !== i) });
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, color: "var(--ink-1)", letterSpacing: "-0.02em", marginBottom: 6 }}>
        Set the action
      </h2>
      <p style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)", marginBottom: 28 }}>
        What should happen when someone triggers this automation?
      </p>

      {/* Type selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {/* Fixed message */}
        <button
          onClick={() => onType("fixed_message")}
          style={{ padding: "16px 16px", borderRadius: 10, textAlign: "left", cursor: "pointer", border: `2px solid ${listenerType === "fixed_message" ? "var(--accent)" : "var(--rule-md)"}`, background: listenerType === "fixed_message" ? "var(--accent-muted)" : "var(--bg-card)", transition: "all 0.12s ease" }}
        >
          <MessageSquare size={18} color={listenerType === "fixed_message" ? "var(--accent)" : "var(--ink-3)"} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 500, color: listenerType === "fixed_message" ? "var(--accent)" : "var(--ink-1)", marginBottom: 3 }}>Fixed message</p>
          <p style={{ fontSize: 11, fontWeight: 300, color: "var(--ink-3)" }}>Send a pre-written reply, PDF, or link</p>
        </button>

        {/* Smart AI */}
        <button
          onClick={() => !aiLocked && onType("smart_ai")}
          style={{ padding: "16px 16px", borderRadius: 10, textAlign: "left", cursor: aiLocked ? "not-allowed" : "pointer", border: `2px solid ${listenerType === "smart_ai" ? "var(--accent)" : "var(--rule-md)"}`, background: listenerType === "smart_ai" ? "var(--accent-muted)" : aiLocked ? "var(--bg-subtle)" : "var(--bg-card)", opacity: aiLocked ? 0.65 : 1, position: "relative", transition: "all 0.12s ease" }}
        >
          {aiLocked && (
            <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 4, background: "var(--yellow-muted)", border: "1px solid var(--yellow-border)", borderRadius: 99, padding: "2px 8px" }}>
              <Lock size={9} color="var(--yellow)" />
              <span style={{ fontSize: 9, fontWeight: 500, color: "var(--yellow)" }}>Smart AI plan</span>
            </div>
          )}
          <Bot size={18} color={listenerType === "smart_ai" ? "var(--accent)" : "var(--ink-3)"} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 500, color: listenerType === "smart_ai" ? "var(--accent)" : "var(--ink-1)", marginBottom: 3 }}>Smart AI</p>
          <p style={{ fontSize: 11, fontWeight: 300, color: "var(--ink-3)" }}>Full conversation in Hinglish, Hindi + 4 more languages</p>
        </button>
      </div>

      {/* Fixed message form */}
      {listenerType === "fixed_message" && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Reply message
          </label>
          <textarea
            value={message}
            onChange={(e) => onMessage(e.target.value)}
            placeholder="Hey! Thanks for your interest. Here's the brochure: [link]. Let me know if you have questions!"
            rows={5}
            style={{ width: "100%", borderRadius: 8, border: "1px solid var(--rule-md)", background: "var(--bg-card)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "10px 12px", outline: "none", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.12s ease" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
          />
          <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
            Tip: paste your Razorpay link or UPI ID directly — SlideIN will send it as text.
          </p>
        </div>
      )}

      {/* Smart AI form */}
      {listenerType === "smart_ai" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>

          {/* Language */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Language</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => onAiConfig({ language: lang.value })}
                  style={{ padding: "6px 12px", borderRadius: 99, fontSize: 12, border: `1.5px solid ${aiConfig.language === lang.value ? "var(--accent)" : "var(--rule-md)"}`, background: aiConfig.language === lang.value ? "var(--accent-muted)" : "var(--bg-card)", color: aiConfig.language === lang.value ? "var(--accent)" : "var(--ink-2)", cursor: "pointer", fontWeight: aiConfig.language === lang.value ? 500 : 300 }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Business description */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>What do you sell?</label>
            <textarea
              value={aiConfig.businessDescription}
              onChange={(e) => onAiConfig({ businessDescription: e.target.value })}
              placeholder="e.g. 3-month online fitness transformation program. Includes meal plan, workout videos, and weekly check-in calls. Price: Rs. 4,999."
              rows={3}
              style={{ width: "100%", borderRadius: 8, border: "1px solid var(--rule-md)", background: "var(--bg-card)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "10px 12px", outline: "none", resize: "vertical", lineHeight: 1.6 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
          </div>

          {/* Tone */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>AI tone</label>
            <input
              value={aiConfig.tone}
              onChange={(e) => onAiConfig({ tone: e.target.value })}
              placeholder="e.g. Friendly and motivating, like a coach talking to a student"
              style={{ width: "100%", height: 40, borderRadius: 8, border: "1px solid var(--rule-md)", background: "var(--bg-card)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "0 12px", outline: "none" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
          </div>

          {/* FAQs */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>FAQs (optional)</label>
              {aiConfig.faqs.length < 5 && (
                <button onClick={addFaq} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
                  <Plus size={12} /> Add FAQ
                </button>
              )}
            </div>
            {aiConfig.faqs.map((faq, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                <input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Question" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule-md)")} />
                <input value={faq.answer}   onChange={(e) => updateFaq(i, "answer",   e.target.value)} placeholder="Answer"   style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule-md)")} />
                <button onClick={() => removeFaq(i)} style={{ width: 36, height: 40, borderRadius: 7, border: "1px solid var(--rule)", background: "none", cursor: "pointer", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {aiConfig.faqs.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic" }}>Add common questions your customers ask — the AI will answer them accurately.</p>
            )}
          </div>

          {/* Payment link */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Payment link (optional)</label>
            <input
              value={aiConfig.paymentLink ?? ""}
              onChange={(e) => onAiConfig({ paymentLink: e.target.value })}
              placeholder="razorpay.me/your-link or UPI ID"
              style={{ ...inputStyle, width: "100%" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
            <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>AI shares this when a lead says they're ready to buy.</p>
          </div>

          {/* Escalation phrase */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Human escalation phrase (optional)</label>
            <input
              value={aiConfig.escalationPhrase ?? ""}
              onChange={(e) => onAiConfig({ escalationPhrase: e.target.value })}
              placeholder="e.g. talk to owner"
              style={{ ...inputStyle, width: "100%" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
            <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>When a lead sends this phrase, the AI stops and you get notified.</p>
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

const inputStyle: React.CSSProperties = {
  height: 40, borderRadius: 8, border: "1px solid var(--rule-md)",
  background: "var(--bg-card)", color: "var(--ink-1)", fontSize: 13,
  fontFamily: "var(--font-sans)", padding: "0 12px", outline: "none",
  transition: "border-color 0.12s ease",
};