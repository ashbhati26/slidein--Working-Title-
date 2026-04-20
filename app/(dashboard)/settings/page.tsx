"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProfileSection }   from "./_components/profile-section";
import { InstagramSection } from "./_components/instagram-section";
import { WhatsAppSection }  from "./_components/whatsapp-section";
import { BillingSection }   from "./_components/billing-section";
import { toast } from "sonner";

type Tab = "profile" | "instagram" | "whatsapp" | "billing";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile",   label: "Profile"   },
  { id: "instagram", label: "Instagram" },
  { id: "whatsapp",  label: "WhatsApp"  },
  { id: "billing",   label: "Billing"   },
];

const IG_ERROR_MESSAGES: Record<string, string> = {
  access_denied:         "Instagram access was denied. Please try again.",
  token_exchange_failed: "Failed to connect. Please try again.",
  config_missing:        "App configuration error. Contact support.",
  no_pages:              "No Facebook Pages found on your account.",
  no_ig_business:        "No Instagram Business account found. Switch to Professional first.",
  profile_fetch_failed:  "Connected but couldn't fetch your profile. Please try reconnecting.",
  account_not_found:     "Session expired. Please sign in again and retry.",
  unknown:               "Something went wrong. Please try again.",
};

function SettingsContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    const igConnected = searchParams.get("ig_connected");
    const igError     = searchParams.get("ig_error");
    if (igConnected === "1") {
      setTab("instagram");
      toast.success("Instagram connected! You can now create automations.");
      window.history.replaceState({}, "", "/settings");
    }
    if (igError) {
      setTab("instagram");
      toast.error(IG_ERROR_MESSAGES[igError] ?? IG_ERROR_MESSAGES.unknown, { duration: 8000 });
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams]);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 28px 64px" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-3)", letterSpacing: "-0.01em" }}>
          Manage your account, connected channels, and billing.
        </p>
      </div>

      {/* Segmented tab control */}
      <div style={{
        display: "inline-flex",
        background: "var(--bg-subtle)",
        border: "0.5px solid var(--rule-md)",
        borderRadius: 9, padding: 3,
        marginBottom: 20, gap: 2,
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "5px 14px", fontSize: 12,
              fontWeight: tab === t.id ? 500 : 400,
              color:      tab === t.id ? "var(--ink-1)" : "var(--ink-3)",
              background: tab === t.id ? "var(--bg)" : "transparent",
              border:     tab === t.id ? "0.5px solid var(--rule-md)" : "none",
              borderRadius: 7,
              cursor: "pointer",
              transition: "all 0.12s ease",
              letterSpacing: "-0.01em",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile"   && <ProfileSection />}
      {tab === "instagram" && <InstagramSection />}
      {tab === "whatsapp"  && <WhatsAppSection />}
      {tab === "billing"   && <BillingSection />}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 28px" }}>
        <div style={{ height: 26, width: 110, borderRadius: 6, background: "var(--rule)", animation: "sk 1.6s ease-in-out infinite", marginBottom: 18 }} />
        <div style={{ height: 32, width: 300, borderRadius: 9,  background: "var(--rule)", animation: "sk 1.6s ease-in-out infinite", marginBottom: 20 }} />
        <div style={{ height: 260, borderRadius: 14, background: "var(--rule)", animation: "sk 1.6s ease-in-out infinite" }} />
        <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}