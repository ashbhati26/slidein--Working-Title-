"use client";

import { useQuery, useMutation } from "convex/react";
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

function buildOAuthUrl(clerkUserId: string): string {
  const appId   = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!appId || !siteUrl) return "";
  const params = new URLSearchParams({
    client_id:     appId,
    redirect_uri:  `${siteUrl}/instagram-oauth-callback`,
    scope:         "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments",
    response_type: "code",
    state:         clerkUserId,
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

function FeatureRow({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "0.5px solid var(--rule)" }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={13} color="var(--accent)" />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", marginBottom: 2, letterSpacing: "-0.01em" }}>{title}</p>
        <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.55, letterSpacing: "-0.005em" }}>{desc}</p>
      </div>
    </div>
  );
}

export function InstagramSection() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const account             = useQuery(api.accounts.getMyAccount);
  const disconnectInstagram = useMutation(api.accounts.disconnectChannel);
  const [disconnecting, setDisconnecting] = useState(false);

  const ig        = account?.instagram;
  const isLoading = account === undefined || !clerkLoaded;
  const noAccount = account === null;

  function handleConnect() {
    const clerkUserId = user?.id;
    if (!clerkUserId) { toast.error("Not signed in. Please refresh and try again."); return; }
    const url = buildOAuthUrl(clerkUserId);
    if (!url) { toast.error("Missing config. Check NEXT_PUBLIC_INSTAGRAM_APP_ID in .env.local"); return; }
    window.location.href = url;
  }

  async function handleDisconnect() {
    if (!confirm(`Disconnect @${ig?.igUsername}?\n\nAll Instagram automations will pause.`)) return;
    setDisconnecting(true);
    try {
      await disconnectInstagram({ channel: "instagram" });
      toast.success("Disconnected. Connect a new account anytime.");
    } catch { toast.error("Failed to disconnect. Please try again."); }
    finally  { setDisconnecting(false); }
  }

  if (isLoading) {
    return (
      <SettingsCard title="Instagram" description="Connect your Instagram Business or Creator account.">
        <div style={{ height: 60, display: "flex", alignItems: "center" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid var(--rule-md)", borderTopColor: "var(--accent)", animation: "spin .7s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </SettingsCard>
    );
  }

  if (noAccount) {
    return (
      <SettingsCard title="Instagram" description="Connect your Instagram Business or Creator account.">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "10px 12px", borderRadius: 9, background: "var(--yellow-muted)", border: "0.5px solid var(--yellow-border)", marginBottom: 16 }}>
          <AlertCircle size={13} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-1)", marginBottom: 2 }}>Account not set up</p>
            <p style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.55 }}>Sign out and sign back in, then return here to connect Instagram.</p>
          </div>
        </div>
        <button onClick={handleConnect} style={{ height: 32, padding: "0 16px", fontSize: 12, borderRadius: 980, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}>
          Connect Instagram
        </button>
      </SettingsCard>
    );
  }

  const tokenExpiringSoon = ig ? ig.tokenExpiresAt - Date.now() < 7 * 24 * 60 * 60 * 1000 : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SettingsCard title="Instagram" description="Connect your Instagram Business or Creator account.">

        {!!ig && !disconnecting ? (
          /* Connected */
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "var(--green-muted)", border: "0.5px solid var(--green-border)", marginBottom: 14 }}>
              {ig.igProfilePicUrl ? (
                <img src={ig.igProfilePicUrl} alt={ig.igUsername} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Camera size={15} color="var(--ink-3)" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <CheckCircle size={12} color="var(--green)" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>@{ig.igUsername}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  Token valid until {new Date(ig.tokenExpiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <a href={`https://instagram.com/${ig.igUsername}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink-3)", display: "flex", padding: 4, flexShrink: 0 }}>
                <ExternalLink size={12} />
              </a>
            </div>

            {tokenExpiringSoon && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, background: "var(--yellow-muted)", border: "0.5px solid var(--yellow-border)", marginBottom: 14 }}>
                <AlertTriangle size={12} color="var(--yellow)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: "var(--ink-2)" }}>Token expires soon. Reconnect to keep automations running.</p>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={handleDisconnect}
                style={{ height: 30, padding: "0 14px", fontSize: 12, borderRadius: 980, border: "0.5px solid var(--red-border)", background: "var(--red-muted)", color: "var(--red)", display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer" }}
              >
                <Unlink size={12} /> Disconnect
              </button>
              <p style={{ fontSize: 11, color: "var(--ink-3)" }}>Pauses all Instagram automations.</p>
            </div>
          </div>

        ) : disconnecting ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 0" }}>
            <Loader2 size={14} style={{ animation: "spin .7s linear infinite", color: "var(--ink-3)" }} />
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Revoking access…</p>
          </div>

        ) : (
          /* Not connected */
          <div>
            <div style={{ marginBottom: 20 }}>
              <FeatureRow icon={MessageSquare} title="Comment to DM" desc="Reel comments trigger instant DM replies — 400 comments handled automatically." />
              <FeatureRow icon={Bot}           title="AI in Hinglish" desc="Gemini chatbot trained on your FAQs, prices, and tone handles full conversations." />
              <FeatureRow icon={Timer}         title="Drip sequences" desc="Timed follow-ups at 24h, 48h, 72h. Auto-cancels the moment they reply." />
              <div style={{ borderBottom: "none" }}>
                <FeatureRow icon={RefreshCw} title="Keyword triggers" desc="Any DM matching your keyword fires an automated reply instantly." />
              </div>
            </div>
            <button onClick={handleConnect} style={{ height: 32, padding: "0 16px", fontSize: 12, borderRadius: 980, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Connect Instagram
            </button>
            <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.6 }}>
              Log in with your Instagram username and password. No Facebook account required.
            </p>
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Requirement" description="Your account must be Business or Creator — not Personal.">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Camera size={14} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", marginBottom: 5, letterSpacing: "-0.01em" }}>Switch to Professional account</p>
            <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10, lineHeight: 1.65 }}>
              Instagram → Profile → ☰ → Settings → Account → Switch to Professional Account → choose Business or Creator. Free, takes 30 seconds.
            </p>
            <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
              <ExternalLink size={11} /> Instagram's official guide
            </a>
          </div>
        </div>
      </SettingsCard>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}