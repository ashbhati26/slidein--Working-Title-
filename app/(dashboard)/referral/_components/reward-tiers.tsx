import { Check, Gift, Target, Star, TrendingUp } from "lucide-react";

const TIERS = [
  { referrals: 1,  reward: "1 month free",            icon: Gift       },
  { referrals: 3,  reward: "3 months free",            icon: Target     },
  { referrals: 5,  reward: "6 months free + showcase", icon: Star       },
  { referrals: 10, reward: "30% recurring commission", icon: TrendingUp },
];

interface RewardTiersProps {
  qualifiedReferrals: number;
  nextTierReferrals:  number | null;
}

export function RewardTiers({ qualifiedReferrals, nextTierReferrals }: RewardTiersProps) {
  return (
    <div style={{
      background: "var(--bg)", border: "0.5px solid var(--rule-md)",
      borderRadius: 14, overflow: "hidden",
    }}>
      <div style={{ padding: "13px 18px", borderBottom: "0.5px solid var(--rule)" }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
          Reward tiers
        </p>
      </div>

      {TIERS.map((tier, i) => {
        const achieved  = qualifiedReferrals >= tier.referrals;
        const isCurrent = nextTierReferrals === tier.referrals;
        const Icon      = tier.icon;

        return (
          <div key={tier.referrals} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 18px",
            borderBottom: i < TIERS.length - 1 ? "0.5px solid var(--rule)" : "none",
            background: achieved ? "var(--accent-muted)" : "transparent",
          }}>
            {/* Status circle */}
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: achieved ? "var(--accent)" : "var(--bg-subtle)",
              border: `0.5px solid ${achieved ? "var(--accent)" : "var(--rule-md)"}`,
            }}>
              {achieved
                ? <Check size={11} color="#fff" />
                : <span style={{ fontSize: 9, color: "var(--ink-3)", fontWeight: 700 }}>{tier.referrals}</span>
              }
            </div>

            {/* Icon box */}
            <div style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              background: achieved ? "var(--accent)" : "var(--bg-subtle)",
              border: `0.5px solid ${achieved ? "var(--accent)" : "var(--rule-md)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={13} color={achieved ? "#fff" : "var(--ink-3)"} />
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em", marginBottom: 1 }}>
                {tier.referrals} paid referral{tier.referrals > 1 ? "s" : ""}
              </p>
              <p style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>{tier.reward}</p>
            </div>

            {achieved && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--accent)", background: "rgba(255,255,255,0.6)", borderRadius: 99, padding: "2px 8px", flexShrink: 0 }}>
                Done
              </span>
            )}
            {isCurrent && !achieved && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--accent)", background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", borderRadius: 99, padding: "2px 8px", flexShrink: 0 }}>
                Next
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}