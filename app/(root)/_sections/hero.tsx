"use client";

import { useEffect, useRef } from "react";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, ChevronRight } from "lucide-react";
import { FadeUp, FadeIn } from "../_components/in-view";
import { Marquee } from "../_components/marquee";
import { Counter } from "../_components/counter";

const TICKER = [
  "Fitness Coaches", "Course Creators", "Instagram Sellers",
  "Real Estate Agents", "Salon Owners", "WhatsApp Businesses",
  "Tutors", "Content Creators",
];

const STATS = [
  { n: 500,  suffix: "M+",    label: "WhatsApp users in India" },
  { n: 999,  prefix: "₹",     suffix: "/mo", label: "Flat rate, unlimited contacts" },
  { n: 2,    suffix: " min",  label: "Average setup time" },
  { n: 6,    suffix: "",      label: "Indian languages supported" },
];

export function Hero() {
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.querySelectorAll<HTMLElement>(".clip-word").forEach((w) =>
        w.classList.add("visible")
      );
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      style={{
        background: "var(--bg)",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        paddingTop: 48,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="container"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 96,
            paddingBottom: 80,
            textAlign: "center",
          }}
        >
          {/* Label */}
          <FadeIn style={{ marginBottom: 20 }}>
            <a
              href="#features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 14,
                color: "var(--accent)",
                letterSpacing: "-0.01em",
                fontWeight: 400,
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Introducing SlideIN for WhatsApp
              <ChevronRight size={14} />
            </a>
          </FadeIn>

          {/* Headline */}
          <div
            ref={headlineRef}
            style={{ marginBottom: 28, maxWidth: 780, margin: "0 auto 28px" }}
          >
            <h1
              className="t-display"
              style={{ textAlign: "center", margin: 0 }}
            >
              {"Your DMs,".split(" ").map((w, i) => (
                <span key={w + i} className="clip-wrap" style={{ marginRight: "0.22em" }}>
                  <span className="clip-word" style={{ transitionDelay: `${i * 0.08}s` }}>{w}</span>
                </span>
              ))}
              <br />
              {"automated.".split("").length > 0 && (
                <span className="clip-wrap">
                  <span
                    className="clip-word"
                    style={{
                      transitionDelay: "0.18s",
                      color: "var(--accent)",
                    }}
                  >
                    automated.
                  </span>
                </span>
              )}
            </h1>
          </div>

          {/* Subhead */}
          <FadeUp delay="d-2" style={{ marginBottom: 40 }}>
            <p
              className="t-subhead"
              style={{
                maxWidth: 540,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              SlideIN turns every Instagram comment and WhatsApp message
              into a qualified lead — keyword triggers, Hinglish AI, drip sequences.
              Setup in under 2 minutes.
            </p>
          </FadeUp>

          {/* CTA */}
          <FadeUp delay="d-3">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary" style={{ height: 44, padding: "0 24px", fontSize: 17, fontWeight: 400, borderRadius: 980 }}>
                    Get started
                  </button>
                </SignUpButton>
                <a
                  href="#how-it-works"
                  className="btn btn-ghost"
                  style={{ height: 44, padding: "0 12px", fontSize: 17, display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 400 }}
                >
                  Learn more <ChevronRight size={16} />
                </a>
              </div>
              <p
                className="t-caption"
                style={{ color: "var(--ink-3)" }}
              >
                Free to start. No credit card required.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>

      <div className="hr" />

      {/* Stats row */}
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            padding: "48px 0",
          }}
          className="hero-stats"
        >
          {STATS.map((s, i) => (
            <FadeUp
              key={s.label}
              delay={`d-${i + 1}` as any}
              style={{
                paddingLeft: i > 0 ? 32 : 0,
                paddingRight: 32,
                borderLeft: i > 0 ? "1px solid var(--rule)" : "none",
                textAlign: "center",
              }}
            >
              <div className="t-stat" style={{ marginBottom: 6, fontSize: "clamp(32px, 4vw, 52px)" }}>
                <Counter
                  end={s.n}
                  prefix={s.prefix ?? ""}
                  suffix={s.suffix}
                  duration={1400}
                />
              </div>
              <p className="t-body-sm" style={{ color: "var(--ink-3)", fontSize: 14 }}>
                {s.label}
              </p>
            </FadeUp>
          ))}
        </div>
      </div>

      <div className="hr" />

      {/* Marquee ticker */}
      <div style={{ padding: "18px 0" }}>
        <Marquee
          speed={40}
          gap={48}
          items={TICKER.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "var(--ink-3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {t}
              <span style={{ marginLeft: 14, opacity: 0.3 }}>·</span>
            </span>
          ))}
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-stats { grid-template-columns: 1fr 1fr !important; gap: 0; }
        }
      `}</style>
    </section>
  );
}