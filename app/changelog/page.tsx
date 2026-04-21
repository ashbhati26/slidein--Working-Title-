import { Zap } from "lucide-react";

export const metadata = {
  title: "Changelog — Svation",
  description: "What's new in Svation.",
};

const ENTRIES = [
  {
    version: "v1.0",
    date: "April 2026",
    tag: "Launch",
    tagColor: "var(--green)",
    tagBg: "var(--green-muted)",
    tagBorder: "var(--green-border)",
    changes: [
      {
        type: "new",
        text: "Instagram comment-to-DM automation — captures leads from Reels at scale",
      },
      {
        type: "new",
        text: "Instagram DM keyword trigger — fires instantly when keyword is received",
      },
      {
        type: "new",
        text: "WhatsApp keyword automation — connects via Meta WhatsApp Cloud API, no BSP",
      },
      {
        type: "new",
        text: "Smart AI chatbot — Google Gemini, responds in Hinglish, Hindi, Tamil, Telugu, Marathi, English",
      },
      {
        type: "new",
        text: "Drip sequences — up to 5 timed follow-up messages, stops on reply",
      },
      {
        type: "new",
        text: "Leads dashboard — two-panel layout, conversation view, manual reply, status tracking",
      },
      {
        type: "new",
        text: "Analytics — 7-day trend, lead status breakdown, channel split, top keywords",
      },
      {
        type: "new",
        text: "Referral program — earn free months or 30% commission",
      },
      {
        type: "new",
        text: "Starter plan free forever — 5 automations, 500 leads/month",
      },
      {
        type: "new",
        text: "Creator plan ₹999/month — unlimited automations, WhatsApp, drip",
      },
      {
        type: "new",
        text: "Smart AI plan ₹2,499/month — everything in Creator plus Gemini AI",
      },
    ],
  },
];

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  new: {
    label: "New",
    color: "var(--accent)",
    bg: "var(--accent-muted)",
    border: "var(--accent-border)",
  },
  fix: {
    label: "Fix",
    color: "var(--green)",
    bg: "var(--green-muted)",
    border: "var(--green-border)",
  },
  improved: {
    label: "Improved",
    color: "#a78bfa",
    bg: "rgba(167,139,250,.08)",
    border: "rgba(167,139,250,.2)",
  },
};

export default function ChangelogPage() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "52px 28px 96px" }}>
      {/* Header */}
      <div style={{ marginBottom: 44 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 12px",
            borderRadius: 99,
            background: "var(--accent-muted)",
            border: "0.5px solid var(--accent-border)",
            marginBottom: 18,
          }}
        >
          <Zap size={12} color="var(--accent)" />
          <span
            style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)" }}
          >
            Changelog
          </span>
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "var(--ink-1)",
            letterSpacing: "-0.04em",
            lineHeight: 1.15,
            marginBottom: 12,
          }}
        >
          What's new
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--ink-3)",
            lineHeight: 1.7,
            letterSpacing: "-0.01em",
          }}
        >
          Every update, fix, and new feature — shipped fast.
        </p>
      </div>

      <div
        style={{
          height: "0.5px",
          background: "var(--rule-md)",
          marginBottom: 44,
        }}
      />

      {/* Entries */}
      {ENTRIES.map((entry) => (
        <div key={entry.version} style={{ marginBottom: 52 }}>
          {/* Entry header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--ink-1)",
                letterSpacing: "-0.02em",
              }}
            >
              {entry.version}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: entry.tagColor,
                background: entry.tagBg,
                border: `0.5px solid ${entry.tagBorder}`,
                borderRadius: 99,
                padding: "2px 8px",
              }}
            >
              {entry.tag}
            </span>
            <span
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                marginLeft: "auto",
              }}
            >
              {entry.date}
            </span>
          </div>

          {/* Changes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entry.changes.map((change, i) => {
              const t = TYPE_CONFIG[change.type] ?? TYPE_CONFIG.new;
              return (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: t.color,
                      background: t.bg,
                      border: `0.5px solid ${t.border}`,
                      borderRadius: 4,
                      padding: "2px 6px",
                      flexShrink: 0,
                      marginTop: 2,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {t.label.toUpperCase()}
                  </span>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--ink-2)",
                      lineHeight: 1.6,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {change.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 12,
          background: "var(--bg-subtle)",
          border: "0.5px solid var(--rule-md)",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            lineHeight: 1.6,
            letterSpacing: "-0.005em",
          }}
        >
          Have a feature request?{" "}
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            WhatsApp us
          </a>{" "}
          or email{" "}
          <a
            href="mailto:support@Svation.com"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            support@Svation.com
          </a>
        </p>
      </div>
    </div>
  );
}
