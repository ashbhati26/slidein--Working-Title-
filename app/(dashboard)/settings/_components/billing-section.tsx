"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Check, Zap, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SettingsCard } from "./settings-card";

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    label: "Free",
    price: 0,
    features: [
      "5 Instagram automations",
      "500 leads / 30 days",
      "Exact keywords only",
      "2 templates",
      "Basic abuse control",
    ],
  },
  {
    id: "creator" as const,
    name: "Creator",
    label: "₹999/mo",
    price: 999,
    features: [
      "Unlimited automations",
      "Unlimited contacts",
      "WhatsApp + Instagram",
      "Advanced + fuzzy keywords",
      "Drip sequences (5 steps)",
      "All templates",
    ],
  },
  {
    id: "smart_ai" as const,
    name: "Smart AI",
    label: "₹2,499/mo",
    price: 2499,
    features: [
      "Everything in Creator",
      "Gemini AI chatbot",
      "6 Indian languages",
      "30-day AI memory",
      "Objection handling",
      "Auto payment links",
    ],
  },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

export function BillingSection() {
  const account = useQuery(api.accounts.getMyAccount);
  const limits = useQuery(api.accounts.getMyLimits);
  const loading = account === undefined;

  const [upgrading, setUpgrading] = useState<PlanId | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const currentPlan: PlanId = (account?.plan as PlanId) ?? "starter";

  async function handleUpgrade(planId: "creator" | "smart_ai") {
    setUpgrading(planId);
    try {
      const res = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json()) as {
        subscriptionId?: string;
        error?: string;
      };
      if (!res.ok || !data.subscriptionId) {
        toast.error(data.error ?? "Failed to start checkout.");
        return;
      }
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        toast.error("Billing not configured. Contact support@Svation.app");
        return;
      }
      // @ts-expect-error — Razorpay loaded via script tag
      const rzp = new window.Razorpay({
        key: keyId,
        subscription_id: data.subscriptionId,
        name: "Svation",
        description:
          planId === "creator"
            ? "Creator Plan — ₹999/month"
            : "Smart AI Plan — ₹2,499/month",
        prefill: { name: account?.name ?? "", email: account?.email ?? "" },
        theme: { color: "#0071e3" },
        modal: { ondismiss: () => setUpgrading(null) },
        handler: () => {
          toast.success("Payment successful! Plan updates in a few seconds.");
          setUpgrading(null);
        },
      }) as { open: () => void };
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUpgrading(null);
    }
  }

  async function handleCancel() {
    if (!account?.razorpaySubscriptionId) {
      toast.error("No active subscription found.");
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: account.razorpaySubscriptionId,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        toast.error(
          data.error ?? "Failed to cancel. Contact support@Svation.app",
        );
        return;
      }
      toast.success(
        "Subscription cancelled. Plan stays active until billing period ends.",
      );
      setShowCancel(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Current plan */}
      <SettingsCard
        title="Current plan"
        description="Your active Svation subscription and usage."
      >
        {loading ? (
          <div style={{ height: 48, display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 100,
                height: 12,
                borderRadius: 4,
                background: "var(--rule)",
                animation: "sk 1.6s ease-in-out infinite",
              }}
            />
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: currentPlan !== "starter" ? 14 : 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "var(--accent-muted)",
                    border: "0.5px solid var(--accent-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap size={14} color="var(--accent)" />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--ink-1)",
                      marginBottom: 2,
                      textTransform: "capitalize",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {currentPlan.replace("_", " ")} plan
                  </p>
                  <p style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    {currentPlan === "starter"
                      ? "Free forever"
                      : currentPlan === "creator"
                        ? "₹999 / month"
                        : "₹2,499 / month"}
                    {account?.subscriptionCurrentPeriodEnd &&
                      currentPlan !== "starter" && (
                        <>
                          {" "}
                          · Renews{" "}
                          {new Date(
                            account.subscriptionCurrentPeriodEnd,
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </>
                      )}
                    {account?.subscriptionStatus === "cancelled" && (
                      <span style={{ color: "var(--red)", marginLeft: 6 }}>
                        · Cancels at period end
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {limits && (
                <div style={{ display: "flex", gap: 20 }}>
                  {[
                    {
                      value: limits.automations.current,
                      max: limits.automations.limit,
                      label: "automations",
                    },
                    {
                      value: limits.leads.current,
                      max: limits.leads.limit,
                      label: "leads",
                    },
                  ].map(({ value, max, label }) => (
                    <div key={label} style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: "var(--ink-1)",
                          letterSpacing: "-0.03em",
                          lineHeight: 1,
                        }}
                      >
                        {value}
                        {max !== Infinity && (
                          <span style={{ fontSize: 12, fontWeight: 400 }}>
                            /{max}
                          </span>
                        )}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--ink-3)",
                          marginTop: 2,
                        }}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {currentPlan !== "starter" &&
              account?.subscriptionStatus === "active" &&
              (!showCancel ? (
                <button
                  onClick={() => setShowCancel(true)}
                  style={{
                    fontSize: 11,
                    color: "var(--ink-3)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Cancel subscription
                </button>
              ) : (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 9,
                    background: "var(--red-muted)",
                    border: "0.5px solid var(--red-border)",
                    marginTop: 2,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <AlertTriangle
                      size={13}
                      color="var(--red)"
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "var(--ink-1)",
                          marginBottom: 3,
                        }}
                      >
                        Cancel subscription?
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--ink-3)",
                          lineHeight: 1.55,
                        }}
                      >
                        Plan stays active until the current billing period ends.
                        Then you move to free Starter and lose access to
                        WhatsApp, drip sequences, and advanced keywords.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <button
                      onClick={() => setShowCancel(false)}
                      style={{
                        height: 30,
                        padding: "0 12px",
                        borderRadius: 7,
                        background: "var(--bg)",
                        border: "0.5px solid var(--rule-md)",
                        color: "var(--ink-2)",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Keep plan
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      style={{
                        height: 30,
                        padding: "0 12px",
                        borderRadius: 7,
                        background: "var(--red)",
                        border: "none",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 500,
                        cursor: cancelling ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        opacity: cancelling ? 0.7 : 1,
                      }}
                    >
                      {cancelling && (
                        <Loader2
                          size={11}
                          style={{ animation: "spin .7s linear infinite" }}
                        />
                      )}
                      {cancelling ? "Cancelling…" : "Yes, cancel"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </SettingsCard>

      {/* Plan comparison */}
      <SettingsCard
        title="Plans"
        description="Flat rate — your bill never grows as your audience grows."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isUpgrade =
              (plan.id === "creator" && currentPlan === "starter") ||
              (plan.id === "smart_ai" && currentPlan !== "smart_ai");
            const isDowngrade = !isCurrent && !isUpgrade;
            const isLoading = upgrading === plan.id;

            return (
              <div
                key={plan.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: 12,
                  gap: 16,
                  flexWrap: "wrap",
                  border: isCurrent
                    ? "1px solid var(--accent)"
                    : "0.5px solid var(--rule-md)",
                  background: isCurrent
                    ? "var(--accent-muted)"
                    : "var(--bg-subtle)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--ink-1)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {plan.name}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: isCurrent ? "var(--accent)" : "var(--ink-1)",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {plan.label}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--accent)",
                          background: "var(--accent-muted)",
                          border: "0.5px solid var(--accent-border)",
                          borderRadius: 980,
                          padding: "2px 7px",
                        }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "3px 14px",
                    }}
                  >
                    {plan.features.map((f) => (
                      <div
                        key={f}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Check size={10} color="var(--green)" />
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--ink-3)",
                            letterSpacing: "-0.005em",
                          }}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flexShrink: 0, alignSelf: "center" }}>
                  {isUpgrade && (
                    <button
                      onClick={() =>
                        handleUpgrade(plan.id as "creator" | "smart_ai")
                      }
                      disabled={!!upgrading}
                      style={{
                        height: 30,
                        padding: "0 14px",
                        fontSize: 12,
                        borderRadius: 980,
                        border: "none",
                        background: upgrading
                          ? "var(--rule-md)"
                          : "var(--accent)",
                        color: upgrading ? "var(--ink-3)" : "#fff",
                        cursor: upgrading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {isLoading && (
                        <Loader2
                          size={12}
                          style={{ animation: "spin .7s linear infinite" }}
                        />
                      )}
                      {isLoading ? "Opening…" : "Upgrade"}
                    </button>
                  )}
                  {isDowngrade && (
                    <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      Contact support to downgrade
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            marginTop: 14,
            lineHeight: 1.6,
          }}
        >
          Payments via Razorpay · UPI, cards, Net Banking · Cancel anytime ·
          7-day refund on first payment
        </p>
      </SettingsCard>

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
