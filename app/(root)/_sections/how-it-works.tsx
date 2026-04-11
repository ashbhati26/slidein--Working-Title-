"use client";

import { FadeUp, FadeIn, AnimLine } from "../_components/in-view";

const STEPS = [
  {
    n: "01",
    title: "Choose your trigger",
    desc: "Pick Instagram or WhatsApp. Type the keyword your audience sends — PRICE, COURSE, FIT. SlideIN watches for it around the clock across every incoming message.",
    tag: "Setup in under 30 seconds",
    visual: (
      <div
        style={{
          background: "var(--bg-subtle)",
          borderRadius: 18,
          padding: 28,
          border: "0.5px solid var(--rule-md)",
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 16 }}>
          Keyword trigger
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {["PRICE", "FIT", "COURSE", "ORDER"].map((kw, i) => (
            <span
              key={kw}
              style={{
                padding: "6px 16px", borderRadius: 980, fontSize: 13, fontWeight: 400,
                background: i === 0 ? "var(--accent)" : "var(--bg)",
                color: i === 0 ? "#ffffff" : "var(--ink-3)",
                border: i === 0 ? "none" : "0.5px solid var(--rule-md)",
                letterSpacing: "-0.01em",
              }}
            >
              {kw}
            </span>
          ))}
        </div>
        <div
          style={{
            padding: "14px 16px", borderRadius: 12,
            background: "var(--bg)",
            border: "0.5px solid var(--rule-md)",
            fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5, fontWeight: 400,
            letterSpacing: "-0.01em",
          }}
        >
          When message contains <strong style={{ fontWeight: 600, color: "var(--ink-1)" }}>"PRICE"</strong> — trigger automation instantly
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>
            Active on Instagram + WhatsApp
          </span>
        </div>
      </div>
    ),
  },
  {
    n: "02",
    title: "Set your action",
    desc: "Send a fixed message — your brochure, catalogue, or payment link. Or enable Smart AI and let it handle the full conversation in Hinglish, qualifying the lead automatically.",
    tag: "AI trained on your FAQs and prices",
    visual: (
      <div
        style={{
          background: "var(--bg-subtle)",
          borderRadius: 18,
          padding: 28,
          border: "0.5px solid var(--rule-md)",
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 16 }}>
          Response type
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[
            { l: "Fixed message", d: "PDF, link, or text", sel: false },
            { l: "Smart AI",      d: "Full conversation",  sel: true  },
          ].map((o) => (
            <div
              key={o.l}
              style={{
                padding: "14px 16px", borderRadius: 12,
                border: o.sel ? `2px solid var(--accent)` : "0.5px solid var(--rule-md)",
                background: o.sel ? "var(--accent-muted)" : "var(--bg)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: o.sel ? "var(--accent)" : "var(--ink-2)", marginBottom: 3, letterSpacing: "-0.01em" }}>
                {o.l}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{o.d}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 16px", background: "var(--bg)", border: "0.5px solid var(--rule)", borderRadius: 12 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>AI preview</div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, fontWeight: 400, letterSpacing: "-0.005em" }}>
            "Yaar, 3-month program ka price sirf ₹4,999 hai. EMI bhi hai — 3×₹1,800. 30-day money back bhi!"
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "Go live. Watch leads roll in.",
    desc: "Hit Go Live. Every qualifying message gets an instant reply — whether you're sleeping, travelling, or on stage. Full conversation history available in your dashboard.",
    tag: "Real-time leads dashboard included",
    visual: (
      <div
        style={{
          background: "var(--bg-subtle)",
          borderRadius: 18,
          padding: 28,
          border: "0.5px solid var(--rule-md)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.015em" }}>Live automations</p>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 980,
            background: "rgba(52,199,89,0.1)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--green)", letterSpacing: "-0.005em" }}>3 active</span>
          </div>
        </div>
        {[
          { n: "Rohan M.", t: "Just now" },
          { n: "Priya S.", t: "2m ago" },
          { n: "Amit K.", t: "5m ago" },
          { n: "Kavya R.", t: "11m ago" },
        ].map((l) => (
          <div
            key={l.n}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 0", borderBottom: "0.5px solid var(--rule)",
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "var(--accent-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: "var(--accent)", flexShrink: 0,
            }}>
              {l.n[0]}
            </div>
            <span style={{ fontSize: 14, fontWeight: 400, color: "var(--ink-1)", flex: 1, letterSpacing: "-0.01em" }}>{l.n}</span>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{l.t}</span>
            <span style={{
              fontSize: 11, fontWeight: 500, color: "var(--accent)",
              background: "var(--accent-muted)",
              borderRadius: 980, padding: "3px 10px",
              letterSpacing: "-0.005em",
            }}>
              Replied
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="container"
        style={{ paddingTop: 80, paddingBottom: 0, textAlign: "center" }}
      >
        <FadeIn>
          <p className="t-label" style={{ marginBottom: 16 }}>How it works</p>
        </FadeIn>
        <FadeUp delay="d-1" style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 className="t-headline">From zero to automated</h2>
          <h2 className="t-headline" style={{ color: "var(--ink-3)" }}>in under 2 minutes.</h2>
        </FadeUp>
        <FadeUp delay="d-2" style={{ marginTop: 20 }}>
          <p className="t-subhead" style={{ fontSize: 19 }}>
            No coding. No developer. No friction.
          </p>
        </FadeUp>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 72,
              alignItems: "center",
              padding: "72px 0",
              borderBottom: i < STEPS.length - 1 ? "0.5px solid var(--rule)" : "none",
            }}
            className="step-row"
          >
            <FadeUp delay="d-1" style={{ order: i % 2 === 0 ? 1 : 2 }}>
              <p
                style={{
                  fontSize: 64,
                  fontWeight: 600,
                  color: "var(--rule-lg)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: 24,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {step.n}
              </p>
              <h3
                style={{
                  fontSize: "clamp(22px, 2.5vw, 32px)",
                  fontWeight: 600,
                  color: "var(--ink-1)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  marginBottom: 16,
                }}
              >
                {step.title}
              </h3>
              <p className="t-body" style={{ marginBottom: 20, fontSize: 17, lineHeight: 1.55 }}>
                {step.desc}
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>
                {step.tag}
              </p>
            </FadeUp>

            <FadeUp delay="d-2" style={{ order: i % 2 === 0 ? 2 : 1 }}>
              {step.visual}
            </FadeUp>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .step-row { grid-template-columns: 1fr !important; gap: 36px !important; padding: 48px 0 !important; }
          .step-row > div { order: unset !important; }
        }
      `}</style>
    </section>
  );
}