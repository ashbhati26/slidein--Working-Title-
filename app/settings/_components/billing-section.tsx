"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";
import { SettingsCard } from "./settings-card";

const PLANS = [
  {
    id:       "starter" as const,
    name:     "Starter",
    label:    "Free",
    price:    0,
    features: ["5 Instagram automations", "500 leads / 30 days", "Exact keywords", "2 templates", "Basic abuse control"],
  },
  {
    id:       "creator" as const,
    name:     "Creator",
    label:    "₹999/mo",
    price:    999,
    features: ["Unlimited automations", "Unlimited contacts", "WhatsApp + Instagram", "Advanced + fuzzy keywords", "Drip sequences (5 steps)", "All templates", "Full abuse control"],
  },
  {
    id:       "smart_ai" as const,
    name:     "Smart AI",
    label:    "₹2,499/mo",
    price:    2499,
    features: ["Everything in Creator", "OpenAI chatbot", "6 Indian languages", "30-day AI memory", "Objection handling", "Auto payment links", "Escalation to human"],
  },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

export function BillingSection() {
  const account = useQuery(api.accounts.getMyAccount);
  const limits  = useQuery(api.accounts.getMyLimits);
  const loading = account === undefined;

  const currentPlan: PlanId = (account?.plan as PlanId) ?? "starter";

  function handleUpgrade(planId: "creator" | "smart_ai") {
    const keyId    = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const planRzId = planId === "creator"
      ? process.env.NEXT_PUBLIC_RAZORPAY_PLAN_CREATOR_ID
      : process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SMART_AI_ID;

    if (!keyId || !planRzId) {
      toast.error("Billing not configured. Contact support at support@slidein.app");
      return;
    }

    // @ts-expect-error — Razorpay loaded via script tag
    const rzp = new window.Razorpay({
      key:             keyId,
      subscription_id: planRzId,
      name:            "SlideIN",
      description:     planId === "creator" ? "Creator Plan — ₹999/month" : "Smart AI Plan — ₹2,499/month",
      prefill:         { name: account?.name ?? "", email: account?.email ?? "" },
      theme:           { color: "#004643" },
      handler: () => {
        toast.success("Payment successful! Your plan will update within a few seconds.");
      },
    }) as { open: () => void };

    rzp.open();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Current plan */}
      <SettingsCard title="Current plan" description="Your active SlideIN subscription and usage.">
        {loading ? (
          <div style={{ height: 60, display: "flex", alignItems: "center" }}>
            <div style={{ width: 120, height: 14, borderRadius: 6, background: "var(--rule)", animation: "sk 1.6s ease-in-out infinite" }} />
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            {/* Plan identity */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--accent-muted)",
                border: "0.5px solid var(--accent-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={15} color="var(--accent)" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-1)", marginBottom: 2, textTransform: "capitalize", letterSpacing: "-0.015em" }}>
                  {currentPlan.replace("_", " ")} plan
                </p>
                <p className="t-caption">
                  {currentPlan === "starter" ? "Free forever" :
                   currentPlan === "creator" ? "₹999 / month" : "₹2,499 / month"}
                  {account?.subscriptionCurrentPeriodEnd && currentPlan !== "starter" && (
                    <> · Renews {new Date(account.subscriptionCurrentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>
                  )}
                </p>
              </div>
            </div>

            {/* Usage numbers */}
            {limits && (
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 22, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {limits.automations.current}
                    {limits.automations.limit !== Infinity && (
                      <span className="t-body-sm" style={{ fontSize: 13, fontWeight: 400 }}>
                        /{limits.automations.limit}
                      </span>
                    )}
                  </p>
                  <p className="t-caption" style={{ marginTop: 2 }}>automations</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 22, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {limits.leads.current}
                    {limits.leads.limit !== Infinity && (
                      <span className="t-body-sm" style={{ fontSize: 13, fontWeight: 400 }}>
                        /{limits.leads.limit}
                      </span>
                    )}
                  </p>
                  <p className="t-caption" style={{ marginTop: 2 }}>leads this period</p>
                </div>
              </div>
            )}
          </div>
        )}
      </SettingsCard>

      {/* Plan comparison */}
      <SettingsCard title="Plans" description="Flat rate — your bill never grows as your audience grows.">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PLANS.map((plan) => {
            const isCurrent   = currentPlan === plan.id;
            const isUpgrade   = (plan.id === "creator"  && currentPlan === "starter") ||
                                (plan.id === "smart_ai" && currentPlan !== "smart_ai");
            const isDowngrade = !isCurrent && !isUpgrade;

            return (
              <div
                key={plan.id}
                style={{
                  display: "flex", alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "16px 18px", borderRadius: 14, gap: 16, flexWrap: "wrap",
                  border: isCurrent ? "1.5px solid var(--accent)" : "0.5px solid var(--rule-md)",
                  background: isCurrent ? "var(--accent-muted)" : "var(--bg-subtle)",
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Name + price row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
                      {plan.name}
                    </span>
                    <span style={{
                      fontSize: 17, fontWeight: 600,
                      color: isCurrent ? "var(--accent-text)" : "var(--ink-1)",
                      letterSpacing: "-0.03em",
                    }}>
                      {plan.label}
                    </span>
                    {isCurrent && (
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: "var(--accent-text)",
                        background: "var(--accent-muted)",
                        border: "0.5px solid var(--accent-border)",
                        borderRadius: 980, padding: "2px 8px",
                        letterSpacing: "0.02em",
                      }}>
                        Current
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Check size={11} color="var(--green)" />
                        <span className="t-caption">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ flexShrink: 0, alignSelf: "center" }}>
                  {isUpgrade && plan.id !== "starter" && (
                    <button
                      onClick={() => handleUpgrade(plan.id as "creator" | "smart_ai")}
                      className="btn btn-primary"
                      style={{ height: 34, padding: "0 16px", fontSize: 13, borderRadius: 980 }}
                    >
                      Upgrade
                    </button>
                  )}
                  {isDowngrade && (
                    <span className="t-caption">Contact support to downgrade</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="t-caption" style={{ marginTop: 16, lineHeight: 1.6 }}>
          Payments via Razorpay · UPI, cards, Net Banking · GST invoice auto-generated · Cancel anytime
        </p>
      </SettingsCard>

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  );
}