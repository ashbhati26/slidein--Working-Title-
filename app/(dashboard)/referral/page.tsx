"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReferralLinkCard } from "./_components/referral-link-card";
import { ReferralStats } from "./_components/referral-stats";
import { ReferralProgress } from "./_components/referral-progress";
import { RewardTiers } from "./_components/reward-tiers";
import { RecentReferrals } from "./_components/recent-referrals";
import { CommissionBanner, HowItWorks } from "./_components/referral-extras";

function Sk({ h = 80 }: { h?: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: h,
        borderRadius: 14,
        background: "var(--rule)",
        animation: "sk 1.6s ease-in-out infinite",
      }}
    />
  );
}

export default function ReferralPage() {
  const data = useQuery(api.accounts.getReferralStats);
  const loading = data === undefined;

  const referralLink =
    typeof window !== "undefined" && data?.referralCode
      ? `${window.location.origin}/?ref=${data.referralCode}`
      : data?.referralCode
        ? `https://Svation.com/?ref=${data.referralCode}`
        : "";

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 28px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: "var(--ink-1)",
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          Referrals
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--ink-3)",
            letterSpacing: "-0.01em",
          }}
        >
          Share Svation and earn free months — or a 30% recurring commission.
        </p>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Sk h={130} />
          <Sk h={96} />
          <Sk h={80} />
          <Sk h={220} />
          <Sk h={160} />
          <Sk h={180} />
          <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
        </div>
      )}

      {!loading && !data && (
        <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
          Unable to load. Please refresh.
        </p>
      )}

      {!loading && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ReferralLinkCard referralLink={referralLink} />
          <ReferralStats
            totalReferrals={data.totalReferrals}
            qualifiedReferrals={data.qualifiedReferrals}
            rewardMonths={data.rewardMonths}
          />
          <ReferralProgress
            qualifiedReferrals={data.qualifiedReferrals}
            nextTier={data.nextTier}
            progressToNext={data.progressToNext}
          />
          {data.commissionEligible && <CommissionBanner />}
          <RewardTiers
            qualifiedReferrals={data.qualifiedReferrals}
            nextTierReferrals={data.nextTier?.referrals ?? null}
          />
          <RecentReferrals referrals={data.recentReferrals as any} />
          <HowItWorks />
        </div>
      )}

      <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  );
}
