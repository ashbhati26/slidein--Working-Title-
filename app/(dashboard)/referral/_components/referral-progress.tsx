interface NextTier { referrals: number; freeMonths: number; commission: number; }

interface ReferralProgressProps {
  qualifiedReferrals: number;
  nextTier:           NextTier | null;
  progressToNext:     number;
}

export function ReferralProgress({ qualifiedReferrals, nextTier, progressToNext }: ReferralProgressProps) {
  if (!nextTier) return null;

  return (
    <div style={{
      background: "var(--bg)", border: "0.5px solid var(--rule-md)",
      borderRadius: 14, padding: "16px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em", marginBottom: 3 }}>
            Next reward
          </p>
          <p style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>
            {qualifiedReferrals} of {nextTier.referrals} paid referrals
            {" · "}{nextTier.referrals - qualifiedReferrals} more to go
          </p>
        </div>
        <div style={{
          padding: "4px 11px", borderRadius: 99, flexShrink: 0,
          background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)" }}>
            {nextTier.freeMonths > 0
              ? `${nextTier.freeMonths} months free`
              : `${nextTier.commission * 100}% commission`}
          </p>
        </div>
      </div>

      <div style={{ height: 5, borderRadius: 99, background: "var(--rule)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${progressToNext}%`,
          background: "var(--accent)",
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}