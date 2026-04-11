"use client";

import { useQuery, useAction } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  CheckCircle, Unlink, ExternalLink, AlertTriangle,
  Camera, AlertCircle, Loader2, MessageSquare,
  Bot, Timer, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { SettingsCard } from "./settings-card";

const IG_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
].join(",");

function buildOAuthUrl(clerkUserId: string): string {
  const appId   = process.env.NEXT_PUBLIC_META_APP_ID;
  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!appId || !siteUrl) return "";
  const params = new URLSearchParams({
    client_id:            appId,
    redirect_uri:         `${siteUrl}/instagram-oauth-callback`,
    scope:                IG_SCOPES,
    response_type:        "code",
    state:                clerkUserId,
    force_authentication: "true",
  });
  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
}

/* ── Feature row — icon + text, no emoji ─────────────────── */
function FeatureRow({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      padding: "14px 0",
      borderBottom: "0.5px solid var(--rule)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: "var(--accent-muted)",
        border: "0.5px solid var(--accent-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={14} color="var(--accent)" />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", marginBottom: 2, letterSpacing: "-0.01em" }}>
          {title}
        </p>
        <p className="t-caption" style={{ lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

export function InstagramSection() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const account             = useQuery(api.accounts.getMyAccount);
  const disconnectInstagram = useAction(api.instagram.disconnectInstagram);
  const [disconnecting, setDisconnecting] = useState(false);

  const ig        = account?.instagram;
  const isLoading = account === undefined || !clerkLoaded;
  const noAccount = account === null;

  function handleConnect() {
    const clerkUserId = user?.id;
    if (!clerkUserId) { toast.error("Not signed in. Please refresh and try again."); return; }
    const url = buildOAuthUrl(clerkUserId);
    if (!url) { toast.error("Missing config. Check NEXT_PUBLIC_META_APP_ID in .env.local"); return; }
    window.location.href = url;
  }

  async function handleDisconnect() {
    if (!confirm(
      `Disconnect @${ig?.igUsername}?\n\nAll Instagram automations will pause. You can reconnect any account after.`
    )) return;
    setDisconnecting(true);
    try {
      await disconnectInstagram({});
      toast.success("Disconnected. Connect a new account anytime.");
    } catch {
      toast.error("Failed to disconnect. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  }

  /* ── Loading ────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <SettingsCard title="Instagram" description="Connect your Instagram Business or Creator account.">
        <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            border: "1.5px solid var(--rule-md)",
            borderTopColor: "var(--accent)",
            animation: "spin .7s linear infinite",
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </SettingsCard>
    );
  }

  /* ── No account ─────────────────────────────────────────── */
  if (noAccount) {
    return (
      <SettingsCard title="Instagram" description="Connect your Instagram Business or Creator account.">
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 14px", borderRadius: 12,
          background: "var(--yellow-muted)",
          border: "0.5px solid var(--yellow-border)",
          marginBottom: 20,
        }}>
          <AlertCircle size={14} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", marginBottom: 2, letterSpacing: "-0.01em" }}>
              Account not set up
            </p>
            <p className="t-caption" style={{ lineHeight: 1.55 }}>
              Sign out and sign back in, then return here to connect Instagram.
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="btn btn-primary"
          style={{ height: 36, padding: "0 20px", fontSize: 13, borderRadius: 980 }}
        >
          Connect Instagram
        </button>
      </SettingsCard>
    );
  }

  const tokenExpiringSoon = ig
    ? ig.tokenExpiresAt - Date.now() < 7 * 24 * 60 * 60 * 1000
    : false;

  const showConnected = !!ig && !disconnecting;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Main connection card */}
      <SettingsCard
        title="Instagram"
        description="Connect your Instagram Business or Creator account."
      >
        {showConnected ? (
          /* ── Connected state ────────────────────────────── */
          <div>
            {/* Account row */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 14,
              background: "var(--green-muted)",
              border: "0.5px solid var(--green-border)",
              marginBottom: 16,
            }}>
              {ig.igProfilePicUrl ? (
                <img
                  src={ig.igProfilePicUrl}
                  alt={ig.igUsername}
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: "var(--bg-subtle)",
                  border: "0.5px solid var(--rule-md)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Camera size={16} color="var(--ink-3)" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <CheckCircle size={13} color="var(--green)" />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
                    @{ig.igUsername}
                  </span>
                </div>
                <p className="t-caption">
                  Token valid until{" "}
                  {new Date(ig.tokenExpiresAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
              <a
                href={`https://instagram.com/${ig.igUsername}`}
                target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--ink-3)", display: "flex", padding: 4, flexShrink: 0 }}
              >
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Expiry warning */}
            {tokenExpiringSoon && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 10,
                background: "var(--yellow-muted)",
                border: "0.5px solid var(--yellow-border)",
                marginBottom: 16,
              }}>
                <AlertTriangle size={13} color="var(--yellow)" style={{ flexShrink: 0 }} />
                <p className="t-caption" style={{ color: "var(--ink-2)" }}>
                  Token expires soon. Disconnect and reconnect to keep automations running.
                </p>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={handleDisconnect}
                className="btn"
                style={{
                  height: 34, padding: "0 16px", fontSize: 13, borderRadius: 980,
                  border: "0.5px solid var(--red-border)",
                  background: "var(--red-muted)",
                  color: "var(--red)",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <Unlink size={13} />
                Disconnect
              </button>
              <p className="t-caption">
                Pauses all Instagram automations.
              </p>
            </div>
          </div>

        ) : disconnecting ? (
          /* ── Disconnecting ──────────────────────────────── */
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0" }}>
            <Loader2 size={16} style={{ animation: "spin .7s linear infinite", color: "var(--ink-3)", flexShrink: 0 }} />
            <p className="t-body-sm">Revoking access…</p>
          </div>

        ) : (
          /* ── Not connected ──────────────────────────────── */
          <div>
            {/* Feature list — icons, no emojis */}
            <div style={{ marginBottom: 24 }}>
              <FeatureRow
                icon={MessageSquare}
                title="Comment to DM"
                desc="Reel comments trigger instant DM replies — 400 comments handled automatically."
              />
              <FeatureRow
                icon={Bot}
                title="AI in Hinglish"
                desc="OpenAI chatbot trained on your FAQs, prices, and tone handles full conversations."
              />
              <FeatureRow
                icon={Timer}
                title="Drip sequences"
                desc="Timed follow-ups at 24h, 48h, 72h. Auto-cancels the moment they reply."
              />
              <div style={{ borderBottom: "none" }}>
                <FeatureRow
                  icon={RefreshCw}
                  title="Keyword triggers"
                  desc="Any incoming DM matching your keyword fires an automated reply instantly."
                />
              </div>
            </div>

            <button
              onClick={handleConnect}
              className="btn btn-primary"
              style={{ height: 36, padding: "0 20px", fontSize: 13, borderRadius: 980 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Connect Instagram
            </button>

            <p className="t-caption" style={{ marginTop: 10, lineHeight: 1.6 }}>
              Log in with your Instagram username and password. No Facebook account required.
            </p>
          </div>
        )}
      </SettingsCard>

      {/* Requirement card */}
      <SettingsCard
        title="Requirement"
        description="Your account must be Business or Creator — not Personal."
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "var(--accent-muted)",
            border: "0.5px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Camera size={16} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", marginBottom: 6, letterSpacing: "-0.01em" }}>
              Switch to Professional account
            </p>
            <p className="t-body" style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.65 }}>
              Instagram → Profile → ☰ → Settings → Account → Switch to Professional Account → choose Business or Creator. Free, takes 30 seconds.
            </p>
            <a
              href="https://help.instagram.com/502981923235522"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 13, color: "var(--accent-text)", textDecoration: "none",
                letterSpacing: "-0.005em",
              }}
            >
              <ExternalLink size={11} /> Instagram's official guide
            </a>
          </div>
        </div>
      </SettingsCard>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}