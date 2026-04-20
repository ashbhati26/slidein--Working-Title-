"use client";

import { Bot, Lock, MessageSquare, Plus, Trash2 } from "lucide-react";
import { NavButtons } from "./nav-buttons";
import type { TriggerType } from "./step1-trigger";

type ListenerType = "fixed_message" | "smart_ai";
type Language     = "english" | "hindi" | "hinglish" | "tamil" | "telugu" | "marathi";

export interface AiConfig {
  language: Language; tone: string; businessDescription: string;
  faqs: { question: string; answer: string }[];
  paymentLink: string; escalationPhrase: string;
}

interface Step4ReplyProps {
  listenerType: ListenerType; message: string; publicReply: string; aiConfig: AiConfig;
  plan: string; triggerType: TriggerType;
  onType: (t: ListenerType) => void; onMessage: (v: string) => void; onPublicReply: (v: string) => void;
  onAiConfig: (v: Partial<AiConfig>) => void; onBack: () => void; onNext: () => void;
}

const LANGS: { value: Language; label: string }[] = [
  { value: "hinglish", label: "Hinglish" }, { value: "hindi",   label: "Hindi"   },
  { value: "english",  label: "English"  }, { value: "tamil",   label: "Tamil"   },
  { value: "telugu",   label: "Telugu"   }, { value: "marathi", label: "Marathi" },
];

export function Step4Reply({ listenerType, message, publicReply, aiConfig, plan, triggerType, onType, onMessage, onPublicReply, onAiConfig, onBack, onNext }: Step4ReplyProps) {
  const aiLocked  = plan !== "smart_ai";
  const isComment = triggerType === "ig_comment";
  const canNext   = listenerType === "fixed_message"
    ? message.trim().length > 0
    : aiConfig.businessDescription.trim().length > 0 && aiConfig.tone.trim().length > 0;

  function addFaq() { onAiConfig({ faqs: [...aiConfig.faqs, { question: "", answer: "" }] }); }
  function updateFaq(i: number, f: "question" | "answer", v: string) { const u = [...aiConfig.faqs]; u[i] = { ...u[i], [f]: v }; onAiConfig({ faqs: u }); }
  function removeFaq(i: number) { onAiConfig({ faqs: aiConfig.faqs.filter((_, idx) => idx !== i) }); }

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 20, lineHeight: 1.6, letterSpacing: "-0.005em" }}>
        {isComment ? "What should SlideIN send when someone comments the keyword?" : "What should SlideIN reply when someone sends the keyword?"}
      </p>

      {/* Type selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[
          { t: "fixed_message" as ListenerType, icon: MessageSquare, label: "Fixed reply", desc: "One pre-written message — brochure, price, link", locked: false },
          { t: "smart_ai"      as ListenerType, icon: Bot,           label: "Smart AI",    desc: "Full conversation in Hinglish, Hindi + 4 languages", locked: aiLocked },
        ].map(({ t, icon: Icon, label, desc, locked }) => (
          <button key={t} onClick={() => !locked && onType(t)} style={{
            padding: "14px", borderRadius: 10, textAlign: "left", cursor: locked ? "not-allowed" : "pointer",
            border: `1px solid ${listenerType === t ? "var(--accent)" : "var(--rule-md)"}`,
            background: listenerType === t ? "var(--accent-muted)" : locked ? "var(--bg-subtle)" : "var(--bg)",
            opacity: locked ? 0.6 : 1, position: "relative", transition: "all 0.12s ease",
          }}>
            {locked && (
              <span style={{ position: "absolute", top: 8, right: 8, fontSize: 9, fontWeight: 600, color: "var(--yellow)", background: "var(--yellow-muted)", border: "0.5px solid var(--yellow-border)", borderRadius: 99, padding: "2px 6px", display: "flex", alignItems: "center", gap: 3 }}>
                <Lock size={7} /> Smart AI plan
              </span>
            )}
            <Icon size={16} color={listenerType === t ? "var(--accent)" : "var(--ink-3)"} style={{ marginBottom: 7 }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: listenerType === t ? "var(--accent)" : "var(--ink-1)", marginBottom: 2, letterSpacing: "-0.01em" }}>{label}</p>
            <p style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5 }}>{desc}</p>
          </button>
        ))}
      </div>

      {/* Fixed message */}
      {listenerType === "fixed_message" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isComment && (
            <div>
              <label style={labelSt}>Public comment reply <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input value={publicReply} onChange={(e) => onPublicReply(e.target.value)} placeholder="e.g. Check your DMs!" style={inputSt}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
              />
              <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 }}>Appears publicly under the comment — visible to everyone. The DM below is private.</p>
            </div>
          )}
          <div>
            <label style={labelSt}>{isComment ? "Private DM message" : "Reply message"}</label>
            <textarea value={message} onChange={(e) => onMessage(e.target.value)} rows={4}
              placeholder="Hey! Thanks for your interest. Here's the full program details: [link]. Pricing starts at Rs. 4,999. DM me ENROLL when you're ready!"
              style={{ width: "100%", borderRadius: 8, border: "0.5px solid var(--rule-md)", background: "var(--bg-subtle)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "10px 12px", outline: "none", resize: "vertical", lineHeight: 1.65, transition: "border-color 0.12s ease", boxSizing: "border-box" as const }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
            <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>Tip: paste your Razorpay link, UPI ID, or PDF link directly in the message.</p>
          </div>
        </div>
      )}

      {/* Smart AI */}
      {listenerType === "smart_ai" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {isComment && (
            <div>
              <label style={labelSt}>Public comment reply <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input value={publicReply} onChange={(e) => onPublicReply(e.target.value)} placeholder="e.g. Check your DMs!" style={inputSt}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
              />
              <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 }}>Appears publicly. AI handles the private DM conversation.</p>
            </div>
          )}
          <div>
            <label style={labelSt}>Language</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {LANGS.map((lang) => (
                <button key={lang.value} onClick={() => onAiConfig({ language: lang.value })} style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, border: `1px solid ${aiConfig.language === lang.value ? "var(--accent)" : "var(--rule-md)"}`, background: aiConfig.language === lang.value ? "var(--accent-muted)" : "var(--bg)", color: aiConfig.language === lang.value ? "var(--accent)" : "var(--ink-2)", cursor: "pointer", fontWeight: aiConfig.language === lang.value ? 600 : 400 }}>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelSt}>What do you sell?</label>
            <textarea value={aiConfig.businessDescription} onChange={(e) => onAiConfig({ businessDescription: e.target.value })} rows={3}
              placeholder="e.g. 3-month online fitness transformation program. Includes meal plan, workout videos, weekly check-in calls. Price: Rs. 4,999."
              style={{ width: "100%", borderRadius: 8, border: "0.5px solid var(--rule-md)", background: "var(--bg-subtle)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "10px 12px", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" as const }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
          </div>
          <div>
            <label style={labelSt}>AI tone</label>
            <input value={aiConfig.tone} onChange={(e) => onAiConfig({ tone: e.target.value })} placeholder="e.g. Friendly and motivating, like a coach talking to a student" style={inputSt}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <label style={{ ...labelSt, marginBottom: 0 }}>FAQs <span style={{ fontWeight: 400 }}>(optional)</span></label>
              {aiConfig.faqs.length < 5 && (
                <button onClick={addFaq} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
                  <Plus size={11} /> Add FAQ
                </button>
              )}
            </div>
            {aiConfig.faqs.map((faq, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 7, marginBottom: 7 }}>
                <input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Question" style={inputSt} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule-md)")} />
                <input value={faq.answer}   onChange={(e) => updateFaq(i, "answer",   e.target.value)} placeholder="Answer"   style={inputSt} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule-md)")} />
                <button onClick={() => removeFaq(i)} style={{ width: 36, height: 36, borderRadius: 7, border: "0.5px solid var(--rule)", background: "none", cursor: "pointer", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {aiConfig.faqs.length === 0 && <p style={{ fontSize: 11, color: "var(--ink-3)", fontStyle: "italic" }}>Add common questions — the AI will answer them accurately.</p>}
          </div>
          <div>
            <label style={labelSt}>Payment link <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <input value={aiConfig.paymentLink} onChange={(e) => onAiConfig({ paymentLink: e.target.value })} placeholder="razorpay.me/your-link or UPI ID" style={inputSt}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
            <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>AI shares this automatically when the buyer says they're ready.</p>
          </div>
          <div>
            <label style={labelSt}>Human escalation phrase <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <input value={aiConfig.escalationPhrase} onChange={(e) => onAiConfig({ escalationPhrase: e.target.value })} placeholder="e.g. talk to owner" style={inputSt}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
            />
            <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>When a lead sends this phrase, the AI stops and you get notified.</p>
          </div>
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canNext} />
    </div>
  );
}

const labelSt: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", letterSpacing: "-0.005em", marginBottom: 6 };
const inputSt: React.CSSProperties = { width: "100%", height: 36, borderRadius: 8, border: "0.5px solid var(--rule-md)", background: "var(--bg-subtle)", color: "var(--ink-1)", fontSize: 13, fontFamily: "var(--font-sans)", padding: "0 12px", outline: "none", transition: "border-color 0.12s ease", boxSizing: "border-box" as const };