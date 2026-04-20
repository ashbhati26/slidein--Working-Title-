import { Users, Trophy, Star } from "lucide-react";

interface ReferralStatsProps {
  totalReferrals:     number;
  qualifiedReferrals: number;
  rewardMonths:       number;
}

export function ReferralStats({ totalReferrals, qualifiedReferrals, rewardMonths }: ReferralStatsProps) {
  const items = [
    { label: "Total referrals",    value: totalReferrals,     icon: Users  },
    { label: "Qualified",          value: qualifiedReferrals, icon: Trophy },
    { label: "Free months earned", value: rewardMonths,       icon: Star   },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} style={{
          background: "var(--bg)", border: "0.5px solid var(--rule-md)",
          borderRadius: 14, padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <Icon size={13} color="var(--accent)" />
          <p style={{
            fontSize: 24, fontWeight: 600, color: "var(--ink-1)",
            letterSpacing: "-0.04em", lineHeight: 1,
            fontFamily: "var(--font-sans)", marginTop: 6,
          }}>
            {value}
          </p>
          <p style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>{label}</p>
        </div>
      ))}
    </div>
  );
}