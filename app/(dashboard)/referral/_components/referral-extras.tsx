import { TrendingUp } from "lucide-react";

export function CommissionBanner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 18px",
        borderRadius: 14,
        background: "var(--accent-muted)",
        border: "0.5px solid var(--accent-border)",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          flexShrink: 0,
          background: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TrendingUp size={14} color="#fff" />
      </div>
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink-1)",
            letterSpacing: "-0.01em",
            marginBottom: 3,
          }}
        >
          30% commission active
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            lineHeight: 1.6,
            letterSpacing: "-0.005em",
          }}
        >
          You earn 30% of every referred user's monthly bill. Email{" "}
          <a
            href="mailto:support@Svation.app"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            support@Svation.app
          </a>{" "}
          to set up your payout method.
        </p>
      </div>
    </div>
  );
}

const STEPS = [
  "Share your referral link with creators, gym trainers, course sellers, or business owners.",
  "They sign up using your link and create a Svation account.",
  "Once they upgrade to a paid plan, the referral qualifies.",
  "Your reward is credited automatically — free months or monthly commission.",
];

export function HowItWorks() {
  return (
    <div
      style={{
        background: "var(--bg)",
        border: "0.5px solid var(--rule-md)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "13px 18px",
          borderBottom: "0.5px solid var(--rule)",
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink-1)",
            letterSpacing: "-0.01em",
          }}
        >
          How it works
        </p>
      </div>
      <div style={{ padding: "4px 18px" }}>
        {STEPS.map((text, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 0",
              borderBottom:
                i < STEPS.length - 1 ? "0.5px solid var(--rule)" : "none",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                flexShrink: 0,
                marginTop: 1,
                background: "var(--accent-muted)",
                border: "0.5px solid var(--accent-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {i + 1}
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--ink-2)",
                lineHeight: 1.65,
                letterSpacing: "-0.005em",
              }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
