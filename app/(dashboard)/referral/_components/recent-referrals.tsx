import { Users } from "lucide-react";

interface ReferralRow {
  id: string; status: string; createdAt: number; qualifiedAt: number | null;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "Pending",   color: "var(--yellow)", bg: "var(--yellow-muted)", border: "var(--yellow-border)" },
  qualified: { label: "Qualified", color: "var(--green)",  bg: "var(--green-muted)",  border: "var(--green-border)"  },
  rewarded:  { label: "Rewarded",  color: "var(--accent)", bg: "var(--accent-muted)", border: "var(--accent-border)" },
  invalid:   { label: "Invalid",   color: "var(--ink-3)",  bg: "var(--rule)",         border: "var(--rule-md)"       },
};

function timeAgo(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30)  return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function RecentReferrals({ referrals }: { referrals: ReferralRow[] }) {
  return (
    <div style={{
      background: "var(--bg)", border: "0.5px solid var(--rule-md)",
      borderRadius: 14, overflow: "hidden",
    }}>
      <div style={{ padding: "13px 18px", borderBottom: "0.5px solid var(--rule)" }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
          Recent referrals
        </p>
      </div>

      {referrals.length === 0 ? (
        <div style={{ padding: "28px 18px", textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: "var(--bg-subtle)", border: "0.5px solid var(--rule-md)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            <Users size={18} color="var(--ink-3)" />
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", marginBottom: 4, letterSpacing: "-0.01em" }}>
            No referrals yet
          </p>
          <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: 240, margin: "0 auto" }}>
            Share your link. Each paid signup earns you a reward.
          </p>
        </div>
      ) : (
        referrals.map((ref, i) => {
          const st = STATUS_STYLE[ref.status] ?? STATUS_STYLE.pending;
          return (
            <div key={ref.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 18px",
              borderBottom: i < referrals.length - 1 ? "0.5px solid var(--rule)" : "none",
            }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-1)", marginBottom: 2, letterSpacing: "-0.01em" }}>
                  Referral #{i + 1}
                </p>
                <p style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>
                  Signed up {timeAgo(ref.createdAt)}
                  {ref.qualifiedAt && ` · Paid ${timeAgo(ref.qualifiedAt)}`}
                </p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, color: st.color,
                background: st.bg, border: `0.5px solid ${st.border}`,
                borderRadius: 99, padding: "2px 9px",
              }}>
                {st.label}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}