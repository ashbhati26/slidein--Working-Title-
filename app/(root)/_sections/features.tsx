"use client";

import {
  MessageCircle, Bot, Timer, Shield, Globe2, Zap,
} from "lucide-react";
import { FadeUp, FadeIn, AnimLine } from "../_components/in-view";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Instagram comment to DM",
    desc: "Someone comments 'PRICE' on your reel. SlideIN fires a DM instantly. 400 comments means 400 DMs, zero effort from you.",
    detail: ["Keyword detection", "Instant delivery", "Works 24/7"],
  },
  {
    icon: Bot,
    title: "Smart AI in Hinglish",
    desc: "OpenAI chatbot trained on your FAQs, prices, and tone. Handles objections, qualifies leads, and shares your payment link when a buyer is ready.",
    detail: ["GPT-powered", "Custom training", "Payment links"],
  },
  {
    icon: Timer,
    title: "Drip sequences",
    desc: "Timed follow-ups at 24h, 48h, 72h. Auto-cancels when they reply. Never let a warm lead go cold again.",
    detail: ["Up to 5 steps", "Auto-cancel on reply", "Customizable timing"],
  },
  {
    icon: Globe2,
    title: "6 Indian languages",
    desc: "English, Hindi, Hinglish, Tamil, Telugu, Marathi. AI responds natively in whatever language your lead texts in.",
    detail: ["Hinglish default", "Auto-detect", "Per-automation setting"],
  },
  {
    icon: Shield,
    title: "Abuse control built-in",
    desc: "200 DM/hr ceiling enforced automatically. Dedup detection, spike alerts, opt-out compliance. Your Instagram stays safe.",
    detail: ["200 DM/hr limit", "Spike detection", "Opt-out compliant"],
  },
  {
    icon: Zap,
    title: "WhatsApp Cloud API direct",
    desc: "No BSP, no middleman. Free official Meta API connection saves thousands per month versus Interakt or Wati.",
    detail: ["No BSP fees", "Official Meta API", "₹0 API cost"],
  },
];

export function Features() {
  return (
    <section
      id="features"
      style={{ background: "var(--bg-subtle)" }}
    >
      {/* Section intro — full-width centered like Apple product page */}
      <div
        className="container"
        style={{ paddingTop: 80, paddingBottom: 0, textAlign: "center" }}
      >
        <FadeIn>
          <p className="t-label" style={{ marginBottom: 16 }}>Features</p>
        </FadeIn>
        <FadeUp delay="d-1" style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 className="t-headline">
            Everything you need.
          </h2>
          <h2 className="t-headline" style={{ color: "var(--ink-3)" }}>
            Nothing you don't.
          </h2>
        </FadeUp>
        <FadeUp delay="d-2" style={{ marginTop: 20, maxWidth: 480, margin: "20px auto 0" }}>
          <p className="t-subhead" style={{ fontSize: 19 }}>
            Built for how Indian creators and business owners actually communicate.
          </p>
        </FadeUp>
      </div>

      {/* Feature grid — Apple card grid */}
      <div
        className="container"
        style={{ paddingTop: 52, paddingBottom: 80 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
          className="features-grid"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeUp
                key={f.title}
                delay={`d-${(i % 3)}` as any}
                style={{
                  background: "var(--bg)",
                  borderRadius: 18,
                  padding: "36px 32px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "var(--accent-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    color: "var(--accent)",
                  }}
                >
                  <Icon size={20} />
                </div>

                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    color: "var(--ink-1)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    marginBottom: 10,
                  }}
                >
                  {f.title}
                </h3>

                <p
                  className="t-body"
                  style={{ fontSize: 15, flex: 1, marginBottom: 24 }}
                >
                  {f.desc}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {f.detail.map((d) => (
                    <div
                      key={d}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        color: "var(--ink-3)",
                      }}
                    >
                      <span
                        style={{
                          width: 4, height: 4, borderRadius: "50%",
                          background: "var(--accent)",
                          flexShrink: 0,
                          opacity: 0.6,
                        }}
                      />
                      {d}
                    </div>
                  ))}
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .features-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .features-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}