"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FadeUp, FadeIn } from "../_components/in-view";

const FAQS = [
  {
    q: "What is Svation?",
    a: "Svation is a WhatsApp and Instagram automation platform built for Indian creators and business owners. Keyword triggers, AI conversations in Hinglish, drip follow-ups — zero coding required.",
  },
  {
    q: "Do I need any coding knowledge?",
    a: "Not at all. The entire setup takes under 2 minutes from your phone. No developer needed. If you can send a WhatsApp message, you can set this up.",
  },
  {
    q: "How does WhatsApp automation work?",
    a: "Svation connects to Meta's WhatsApp Cloud API directly — no third-party BSP. When a customer messages your number with your keyword, Svation replies instantly through your connected business number.",
  },
  {
    q: "What languages does Smart AI support?",
    a: "English, Hindi, Hinglish (default), Tamil, Telugu, and Marathi. You choose per automation — your fitness bot can reply in Hinglish while your real estate bot replies in Telugu.",
  },
  {
    q: "Will my Instagram account get banned?",
    a: "Svation's Abuse Control auto-enforces a 200 DM/hr safe ceiling, deduplicates triggers, and detects spikes. We use official Meta APIs only — no scraping or unofficial tools.",
  },
  {
    q: "Can Svation send payment links?",
    a: "Yes. Paste your Razorpay link or UPI ID into your message. The AI shares it automatically when buying intent is detected. All payment processing goes directly between you and your customer.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Starter plan is completely free — 5 Instagram automations, 500 leads per 30-day rolling window, 2 pre-built templates. No credit card required.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ background: "var(--bg)" }}>
      <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <FadeIn>
            <p className="t-label" style={{ marginBottom: 16 }}>
              FAQ
            </p>
          </FadeIn>
          <FadeUp delay="d-1" style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 className="t-headline">Questions?</h2>
            <h2 className="t-headline" style={{ color: "var(--ink-3)" }}>
              We have answers.
            </h2>
          </FadeUp>
        </div>

        {/* Accordion — centered max-width like Apple */}
        <FadeUp delay="d-1" style={{ maxWidth: 680, margin: "0 auto" }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                borderTop: "0.5px solid var(--rule)",
                ...(i === FAQS.length - 1
                  ? { borderBottom: "0.5px solid var(--rule)" }
                  : {}),
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 20,
                }}
              >
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 400,
                    color: "var(--ink-1)",
                    lineHeight: 1.35,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {faq.q}
                </span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background:
                      open === i ? "var(--ink-1)" : "var(--bg-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: open === i ? "var(--ink-inv)" : "var(--ink-3)",
                    transition: "background 0.15s ease, color 0.15s ease",
                  }}
                >
                  {open === i ? <Minus size={12} /> : <Plus size={12} />}
                </div>
              </button>
              <div
                style={{
                  maxHeight: open === i ? 300 : 0,
                  overflow: "hidden",
                  transition:
                    "max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                <p
                  className="t-body"
                  style={{
                    fontSize: 15,
                    paddingBottom: 20,
                    lineHeight: 1.7,
                    color: "var(--ink-2)",
                  }}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </FadeUp>

        {/* Bottom CTA */}
        <FadeIn style={{ textAlign: "center", marginTop: 48 }}>
          <p className="t-body" style={{ marginBottom: 16, fontSize: 15 }}>
            Still have questions?
          </p>
          <a
            href="https://wa.me/919999999999"
            style={{
              fontSize: 15,
              color: "var(--accent)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Chat with us on WhatsApp →
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
