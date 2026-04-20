"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SettingsCard, labelSt, inputSt } from "./settings-card";

export function ProfileSection() {
  const { user } = useUser();
  const account = useQuery(api.accounts.getMyAccount);
  const updateProfile = useMutation(api.accounts.updateProfile);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (account?.name) {
      setName(account.name);
      setChanged(false);
    }
  }, [account?.name]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success("Profile updated.");
      setChanged(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const loading = account === undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Profile */}
      <SettingsCard
        title="Profile"
        description="Your name shown inside Svation."
      >
        {/* Avatar row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={name}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                objectFit: "cover",
                border: "0.5px solid var(--rule-md)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--accent-muted)",
                border: "0.5px solid var(--accent-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 600,
                color: "var(--accent)",
                flexShrink: 0,
              }}
            >
              {name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--ink-1)",
                marginBottom: 2,
                letterSpacing: "-0.01em",
              }}
            >
              {loading ? "—" : name || "—"}
            </p>
            <p style={{ fontSize: 12, color: "var(--ink-3)" }}>
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
          </div>
        </div>

        {/* Name field */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelSt}>Display name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setChanged(true);
            }}
            placeholder="Your name"
            disabled={loading}
            style={inputSt}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--accent)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--rule-md)")
            }
          />
        </div>

        {/* Email field */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelSt}>Email</label>
          <input
            value={user?.primaryEmailAddress?.emailAddress ?? ""}
            disabled
            style={{ ...inputSt, opacity: 0.5, cursor: "not-allowed" }}
          />
          <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
            Managed by your sign-in provider.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!changed || saving || !name.trim()}
          style={{
            height: 32,
            padding: "0 16px",
            fontSize: 12,
            borderRadius: 980,
            background:
              changed && name.trim() ? "var(--accent)" : "var(--bg-subtle)",
            color: changed && name.trim() ? "#fff" : "var(--ink-3)",
            border:
              changed && name.trim() ? "none" : "0.5px solid var(--rule-md)",
            cursor: changed && name.trim() ? "pointer" : "not-allowed",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s ease",
          }}
        >
          {saving && (
            <Loader2
              size={12}
              style={{ animation: "spin .7s linear infinite" }}
            />
          )}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </SettingsCard>

      {/* Plan summary */}
      {account && (
        <SettingsCard
          title="Your plan"
          description="Current Svation subscription."
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--ink-1)",
                  letterSpacing: "-0.025em",
                  marginBottom: 2,
                  textTransform: "capitalize",
                }}
              >
                {account.plan.replace("_", " ")} plan
              </p>
              <p style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {account.plan === "starter"
                  ? "Free forever"
                  : account.plan === "creator"
                    ? "₹999 / month"
                    : "₹2,499 / month"}
              </p>
            </div>
            {account.plan === "starter" && (
              <a
                href="/settings?tab=billing"
                style={{
                  height: 30,
                  padding: "0 14px",
                  borderRadius: 980,
                  fontSize: 12,
                  color: "var(--accent)",
                  background: "var(--accent-muted)",
                  border: "0.5px solid var(--accent-border)",
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                  letterSpacing: "-0.005em",
                }}
              >
                Upgrade
              </a>
            )}
          </div>
        </SettingsCard>
      )}

      {/* Referral */}
      {account?.referralCode && (
        <SettingsCard
          title="Referral link"
          description="Earn 1 free month per paid referral. 10+ = 30% recurring commission."
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "0.5px solid var(--rule-md)",
                background: "var(--bg-subtle)",
                fontSize: 12,
                color: "var(--ink-2)",
                letterSpacing: "-0.005em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {typeof window !== "undefined"
                ? `${window.location.origin}/?ref=${account.referralCode}`
                : `/?ref=${account.referralCode}`}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/?ref=${account.referralCode}`,
                );
                toast.success("Referral link copied!");
              }}
              style={{
                height: 32,
                padding: "0 12px",
                fontSize: 12,
                borderRadius: 8,
                color: "var(--ink-2)",
                background: "var(--bg-subtle)",
                border: "0.5px solid var(--rule-md)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Copy
            </button>
          </div>
        </SettingsCard>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
