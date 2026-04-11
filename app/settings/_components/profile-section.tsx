"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SettingsCard, labelSt, inputSt } from "./settings-card";

export function ProfileSection() {
  const { user }      = useUser();
  const account       = useQuery(api.accounts.getMyAccount);
  const updateProfile = useMutation(api.accounts.updateProfile);

  const [name,    setName]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (account?.name) { setName(account.name); setChanged(false); }
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

      {/* Profile card */}
      <SettingsCard title="Profile" description="Your name shown inside SlideIN.">

        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={name}
              style={{
                width: 52, height: 52, borderRadius: "50%",
                objectFit: "cover",
                border: "0.5px solid var(--rule-md)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "var(--accent-muted)",
              border: "0.5px solid var(--accent-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 600,
              color: "var(--accent-text)",
              flexShrink: 0,
            }}>
              {name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-1)", marginBottom: 2, letterSpacing: "-0.015em" }}>
              {loading ? "—" : (name || "—")}
            </p>
            <p className="t-caption">
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelSt}>Display name</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setChanged(true); }}
            placeholder="Your name"
            disabled={loading}
            style={inputSt}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelSt}>Email</label>
          <input
            value={user?.primaryEmailAddress?.emailAddress ?? ""}
            disabled
            style={{ ...inputSt, opacity: 0.5, cursor: "not-allowed" }}
          />
          <p className="t-caption" style={{ marginTop: 6 }}>
            Managed by your sign-in provider.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!changed || saving || !name.trim()}
          className="btn"
          style={{
            height: 34, padding: "0 18px", fontSize: 13, borderRadius: 980,
            background: changed && name.trim() ? "var(--accent)" : "var(--bg-subtle)",
            color: changed && name.trim() ? "var(--ink-inv)" : "var(--ink-3)",
            border: changed && name.trim() ? "none" : "0.5px solid var(--rule-md)",
            cursor: changed && name.trim() ? "pointer" : "not-allowed",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          {saving && <Loader2 size={13} style={{ animation: "spin .7s linear infinite" }} />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </SettingsCard>

      {/* Plan */}
      {account && (
        <SettingsCard title="Your plan" description="Current SlideIN subscription.">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.025em", marginBottom: 2, textTransform: "capitalize" }}>
                {account.plan.replace("_", " ")} plan
              </p>
              <p className="t-body-sm">
                {account.plan === "starter" ? "Free forever" :
                 account.plan === "creator" ? "₹999 / month" : "₹2,499 / month"}
              </p>
            </div>
            {account.plan === "starter" && (
              <a
                href="/settings?tab=billing"
                className="btn"
                style={{
                  height: 34, padding: "0 16px", fontSize: 13, borderRadius: 980,
                  color: "var(--accent-text)",
                  background: "var(--accent-muted)",
                  border: "0.5px solid var(--accent-border)",
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
        <SettingsCard title="Referral" description="Earn 1 free month per paid referral. 10+ referrals = 30% recurring commission.">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              flex: 1, padding: "9px 14px", borderRadius: 980,
              border: "0.5px solid var(--rule-md)",
              background: "var(--bg-subtle)",
              fontSize: 12, color: "var(--ink-2)",
              letterSpacing: "-0.005em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {typeof window !== "undefined"
                ? `${window.location.origin}/?ref=${account.referralCode}`
                : `/?ref=${account.referralCode}`}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/?ref=${account.referralCode}`);
                toast.success("Referral link copied!");
              }}
              className="btn"
              style={{
                height: 34, padding: "0 14px", fontSize: 13, borderRadius: 980,
                color: "var(--ink-2)", background: "var(--bg-subtle)",
                border: "0.5px solid var(--rule-md)", flexShrink: 0,
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