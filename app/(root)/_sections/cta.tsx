"use client";

import { SignUpButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import { FadeUp, FadeIn } from "../_components/in-view";

export function CTA() {
  return (
    <section style={{ background: "var(--bg-subtle)" }}>
      <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <FadeUp>
          <div
            style={{
              borderRadius: 24,
              background: "var(--ink-1)",
              padding: "88px 64px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", zIndex: 1 }}>
              <FadeIn style={{ marginBottom: 12 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 0,
                  }}
                >
                  Get started today
                </p>
              </FadeIn>

              <FadeUp delay="d-1" style={{ marginBottom: 20 }}>
                <h2
                  style={{
                    fontSize: "clamp(32px, 5vw, 60px)",
                    fontWeight: 600,
                    lineHeight: 1.07,
                    letterSpacing: "-0.04em",
                    color: "#ffffff",
                  }}
                >
                  Stop losing leads
                  <br />
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>
                    while you sleep.
                  </span>
                </h2>
              </FadeUp>

              <FadeUp delay="d-2" style={{ marginBottom: 40 }}>
                <p
                  style={{
                    fontSize: 19,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.5)",
                    maxWidth: 440,
                    margin: "0 auto",
                    lineHeight: 1.47,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Join Indian creators and business owners who've replaced
                  manual DM replies with Svation.
                </p>
              </FadeUp>

              <FadeUp delay="d-3">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <SignUpButton mode="modal">
                      <button
                        style={{
                          height: 44,
                          padding: "0 24px",
                          borderRadius: 980,
                          fontSize: 17,
                          fontWeight: 400,
                          background: "#ffffff",
                          color: "#1d1d1f",
                          border: "none",
                          cursor: "pointer",
                          transition: "opacity 0.15s ease",
                          letterSpacing: "-0.01em",
                          fontFamily: "var(--font-sans)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "0.88";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                      >
                        Start for free
                      </button>
                    </SignUpButton>
                    <a
                      href="#features"
                      style={{
                        height: 44,
                        padding: "0 12px",
                        fontSize: 17,
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.6)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        letterSpacing: "-0.01em",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#ffffff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
                      }
                    >
                      Learn more <ChevronRight size={16} />
                    </a>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.25)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    Free plan · 5 automations · No credit card required
                  </p>
                </div>
              </FadeUp>
            </div>
          </div>
        </FadeUp>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cta-inner { padding: 56px 28px !important; }
        }
      `}</style>
    </section>
  );
}
