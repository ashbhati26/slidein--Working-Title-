"use client";

import { useState } from "react";
import { SignUpButton } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { FadeUp, FadeIn } from "../_components/in-view";

const PLANS = [
  {
    name: "Starter",
    price: 0,
    tag: "Free",
    desc: "Get started with automation.",
    highlight: false,
    features: [
      "5 Instagram automations",
      "500 leads / 30 days",
      "Exact keyword matching",
      "PDFs and links",
      "Basic abuse control",
      "2 templates",
      "Community support",
    ],
    missing: ["WhatsApp", "Drip sequences", "Smart AI", "Advanced keywords"],
    cta: "Get started free",
    ctaStyle: "outline" as const,
  },
  {
    name: "Creator",
    price: 999,
    tag: "Most Popular",
    desc: "Unlimited automations, WhatsApp, and drip.",
    highlight: true,
    features: [
      "Unlimited automations",
      "Unlimited contacts",
      "WhatsApp + Instagram",
      "Advanced + fuzzy keywords",
      "Drip sequences (5 steps)",
      "All 6 templates",
      "Full abuse control",
      "WhatsApp support",
    ],
    missing: ["Smart AI", "Multi-language AI", "AI memory"],
    cta: "Get Creator",
    ctaStyle: "filled" as const,
  },
  {
    name: "Smart AI",
    price: 2499,
    tag: "Full Power",
    desc: "Replace your DM setter with AI.",
    highlight: false,
    features: [
      "Everything in Creator",
      "OpenAI chatbot",
      "6 Indian languages",
      "30-day AI memory",
      "Objection handling",
      "Auto payment links",
      "Escalation to human",
      "Priority support",
    ],
    missing: [],
    cta: "Get Smart AI",
    ctaStyle: "outline" as const,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" style={{ background: "var(--bg-subtle)" }}>
      <div className="container" style={{ paddingTop: 80, paddingBottom: 0, textAlign: "center" }}>
        <FadeIn>
          <p className="t-label" style={{ marginBottom: 16 }}>Pricing</p>
        </FadeIn>
        <FadeUp delay="d-1" style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 className="t-headline">Priced for India.</h2>
          <h2 className="t-headline" style={{ color: "var(--ink-3)" }}>Not Silicon Valley.</h2>
        </FadeUp>
        <FadeUp delay="d-2" style={{ marginTop: 20 }}>
          <p className="t-subhead" style={{ fontSize: 19 }}>
            Flat rate. Unlimited contacts. Your bill never grows as your audience grows.
          </p>
        </FadeUp>

        {/* Annual toggle */}
        <FadeIn style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 40, justifyContent: "center" }}>
          <span
            style={{
              fontSize: 14, fontWeight: 400,
              color: !annual ? "var(--ink-1)" : "var(--ink-3)",
              transition: "color 0.15s ease",
              letterSpacing: "-0.01em",
            }}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            style={{
              width: 40, height: 24, borderRadius: 980,
              background: annual ? "var(--accent)" : "var(--rule-lg)",
              border: "none",
              cursor: "pointer", position: "relative", padding: 0,
              transition: "background 0.2s ease", flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute", top: 4,
              left: annual ? 20 : 4,
              width: 16, height: 16, borderRadius: "50%",
              background: "#ffffff",
              transition: "left 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </button>
          <span
            style={{
              fontSize: 14, fontWeight: 400,
              color: annual ? "var(--ink-1)" : "var(--ink-3)",
              transition: "color 0.15s ease",
              display: "flex", alignItems: "center", gap: 8,
              letterSpacing: "-0.01em",
            }}
          >
            Annual
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: "var(--accent)",
              background: "var(--accent-muted)",
              borderRadius: 980, padding: "2px 8px", letterSpacing: "0",
            }}>
              Save 20%
            </span>
          </span>
        </FadeIn>
      </div>

      {/* Cards */}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            alignItems: "start",
          }}
          className="pricing-grid"
        >
          {PLANS.map((plan, i) => {
            const price = annual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price;

            return (
              <FadeUp
                key={plan.name}
                delay={`d-${i + 1}` as any}
                style={{
                  padding: "32px 28px",
                  borderRadius: 20,
                  background: plan.highlight ? "var(--ink-1)" : "var(--bg)",
                  border: plan.highlight ? "none" : "0.5px solid var(--rule-md)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: 20, right: 20,
                    fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
                    color: "var(--ink-1)",
                    background: "#ffffff",
                    borderRadius: 980, padding: "3px 10px",
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600,
                    color: plan.highlight ? "rgba(255,255,255,0.5)" : "var(--ink-3)",
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    marginBottom: 4,
                  }}>
                    {plan.name}
                  </p>
                  <p style={{
                    fontSize: 14, fontWeight: 400,
                    color: plan.highlight ? "rgba(255,255,255,0.5)" : "var(--ink-3)",
                    letterSpacing: "-0.01em", lineHeight: 1.4,
                  }}>
                    {plan.desc}
                  </p>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{
                      fontSize: "clamp(44px, 5vw, 56px)",
                      fontWeight: 600,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: plan.highlight ? "#ffffff" : "var(--ink-1)",
                      fontFamily: "var(--font-sans)",
                    }}>
                      {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                    </span>
                    {price > 0 && (
                      <span style={{
                        fontSize: 14,
                        color: plan.highlight ? "rgba(255,255,255,0.4)" : "var(--ink-3)",
                        letterSpacing: "-0.01em",
                      }}>
                        /mo
                      </span>
                    )}
                  </div>
                  {annual && price > 0 && (
                    <p style={{
                      fontSize: 12,
                      color: plan.highlight ? "rgba(255,255,255,0.4)" : "var(--ink-3)",
                      marginTop: 4,
                    }}>
                      ₹{(price * 12).toLocaleString("en-IN")}/yr
                    </p>
                  )}
                </div>

                <SignUpButton mode="modal">
                  <button
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 980,
                      fontSize: 15,
                      fontWeight: 400,
                      cursor: "pointer",
                      marginBottom: 24,
                      transition: "all 0.15s ease",
                      letterSpacing: "-0.01em",
                      fontFamily: "var(--font-sans)",
                      background: plan.highlight ? "#ffffff" : "var(--accent)",
                      color: plan.highlight ? "var(--ink-1)" : "#ffffff",
                      border: "none",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    {plan.cta}
                  </button>
                </SignUpButton>

                <div style={{ height: "0.5px", background: plan.highlight ? "rgba(255,255,255,0.1)" : "var(--rule)", marginBottom: 20 }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <Check
                        size={14}
                        style={{
                          color: plan.highlight ? "rgba(255,255,255,0.6)" : "var(--accent)",
                          flexShrink: 0, marginTop: 2,
                        }}
                      />
                      <span style={{
                        fontSize: 14, fontWeight: 400,
                        color: plan.highlight ? "rgba(255,255,255,0.7)" : "var(--ink-2)",
                        letterSpacing: "-0.01em",
                      }}>
                        {f}
                      </span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: 0.25 }}>
                      <div style={{ width: 14, height: 14, flexShrink: 0 }} />
                      <span style={{
                        fontSize: 14, fontWeight: 400,
                        color: plan.highlight ? "rgba(255,255,255,0.5)" : "var(--ink-3)",
                        letterSpacing: "-0.01em",
                        textDecoration: "line-through",
                      }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </FadeUp>
            );
          })}
        </div>

        <FadeIn style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{
            fontSize: 13, fontWeight: 400,
            color: "var(--ink-3)", letterSpacing: "-0.005em",
          }}>
            No hidden fees · No per-contact charges · Cancel anytime · GST invoice auto-generated
          </p>
        </FadeIn>
      </div>

      <style>{`
        @media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; } }
      `}</style>
    </section>
  );
}