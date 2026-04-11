"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Phone, CheckCircle, Unlink, ExternalLink, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SettingsCard, labelSt, inputSt } from "./settings-card";

export function WhatsAppSection() {
  const account    = useQuery(api.accounts.getMyAccount);
  const limits     = useQuery(api.accounts.getMyLimits);
  const connectWA  = useMutation(api.accounts.connectWhatsApp);
  const disconnect = useMutation(api.accounts.disconnectChannel);

  const [showForm,      setShowForm]      = useState(false);
  const [phoneId,       setPhoneId]       = useState("");
  const [phone,         setPhone]         = useState("");
  const [wabaId,        setWabaId]        = useState("");
  const [token,         setToken]         = useState("");
  const [saving,        setSaving]        = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const wa      = account?.whatsapp;
  const loading = account === undefined;
  const isPaid  = limits?.plan !== "starter";

  async function handleConnect() {
    const missing = [
      !phoneId.trim() && "Phone Number ID",
      !phone.trim()   && "Display phone number",
      !wabaId.trim()  && "WABA ID",
      !token.trim()   && "Access token",
    ].filter(Boolean);
    if (missing.length) { toast.error(`Missing: ${missing.join(", ")}`); return; }

    setSaving(true);
    try {
      await connectWA({
        phoneNumberId:      phoneId.trim(),
        displayPhoneNumber: phone.trim(),
        wabaId:             wabaId.trim(),
        accessToken:        token.trim(),
      });
      toast.success("WhatsApp connected!");
      setShowForm(false);
      setPhoneId(""); setPhone(""); setWabaId(""); setToken("");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Failed to connect. Check your credentials and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect WhatsApp? All WhatsApp automations will stop immediately.")) return;
    setDisconnecting(true);
    try {
      await disconnect({ channel: "whatsapp" });
      toast.success("WhatsApp disconnected.");
    } catch {
      toast.error("Failed to disconnect.");
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) return null;

  /* ── Upgrade gate ───────────────────────────────────────── */
  if (!isPaid) {
    return (
      <SettingsCard title="WhatsApp" description="Automate your WhatsApp Business number.">
        <div style={{ padding: "24px 0", textAlign: "center" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(37,211,102,0.08)",
            border: "0.5px solid rgba(37,211,102,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}>
            <Phone size={20} color="#25D366" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-1)", marginBottom: 6, letterSpacing: "-0.015em" }}>
            WhatsApp requires Creator plan
          </p>
          <p className="t-body-sm" style={{ marginBottom: 20, maxWidth: 300, margin: "0 auto 20px", lineHeight: 1.6 }}>
            Upgrade to Creator (₹999/month) to connect your WhatsApp Business number.
          </p>
          <a
            href="/settings"
            className="btn btn-primary"
            style={{ height: 34, padding: "0 18px", fontSize: 13, borderRadius: 980 }}
          >
            View billing
          </a>
        </div>
      </SettingsCard>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Connection card */}
      <SettingsCard
        title="WhatsApp Business"
        description="Connect via Meta WhatsApp Cloud API — no third-party BSP, no extra cost."
      >
        {wa ? (
          /* ── Connected ──────────────────────────────────── */
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 14,
              background: "var(--green-muted)",
              border: "0.5px solid var(--green-border)",
              marginBottom: 16,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: "rgba(37,211,102,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Phone size={18} color="#25D366" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <CheckCircle size={13} color="var(--green)" />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
                    {wa.displayPhoneNumber}
                  </span>
                  {wa.verifiedName && (
                    <span className="t-caption">· {wa.verifiedName}</span>
                  )}
                </div>
                <p className="t-caption">
                  Daily limit: {wa.messagingLimit.toLocaleString("en-IN")} numbers
                </p>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="btn"
              style={{
                height: 34, padding: "0 16px", fontSize: 13, borderRadius: 980,
                border: "0.5px solid var(--red-border)",
                background: "var(--red-muted)",
                color: "var(--red)",
                display: "inline-flex", alignItems: "center", gap: 6,
                opacity: disconnecting ? 0.6 : 1,
              }}
            >
              <Unlink size={13} />
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>

        ) : !showForm ? (
          /* ── Not connected ──────────────────────────────── */
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", borderRadius: 12,
              background: "var(--bg-subtle)",
              border: "0.5px solid var(--rule-md)",
              marginBottom: 18,
            }}>
              <AlertCircle size={13} color="var(--ink-3)" style={{ flexShrink: 0 }} />
              <p className="t-body-sm">
                No WhatsApp number connected. Follow the setup guide below to get your credentials.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              style={{ height: 34, padding: "0 18px", fontSize: 13, borderRadius: 980 }}
            >
              Enter credentials
            </button>
          </div>

        ) : (
          /* ── Credential form ────────────────────────────── */
          <div>
            <p className="t-body-sm" style={{ marginBottom: 18, lineHeight: 1.55 }}>
              Get these from{" "}
              <a
                href="https://developers.facebook.com"
                target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent-text)", textDecoration: "underline" }}
              >
                Meta Developer Dashboard
              </a>{" "}
              → your app → WhatsApp → API Setup.
            </p>

            {[
              { label: "Phone Number ID",                     key: "phoneId", val: phoneId, set: setPhoneId, ph: "Found in WhatsApp → API Setup"  },
              { label: "Display Phone Number",                key: "phone",   val: phone,   set: setPhone,   ph: "+91 98765 43210"                 },
              { label: "WhatsApp Business Account ID (WABA)", key: "wabaId",  val: wabaId,  set: setWabaId,  ph: "Your WABA ID"                    },
              { label: "Permanent System User Token",         key: "token",   val: token,   set: setToken,   ph: "EAAxxxxxxxxxxxxxxx"               },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={labelSt}>{f.label}</label>
                <input
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph}
                  disabled={saving}
                  style={inputSt}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button
                onClick={() => setShowForm(false)}
                className="btn"
                style={{
                  height: 34, padding: "0 16px", fontSize: 13, borderRadius: 980,
                  background: "var(--bg-subtle)", color: "var(--ink-3)",
                  border: "0.5px solid var(--rule-md)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={saving}
                className="btn btn-primary"
                style={{
                  height: 34, padding: "0 18px", fontSize: 13, borderRadius: 980,
                  display: "inline-flex", alignItems: "center", gap: 6,
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saving && <Loader2 size={13} style={{ animation: "spin .7s linear infinite" }} />}
                {saving ? "Connecting…" : "Connect"}
              </button>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* Setup guide */}
      <SettingsCard
        title="Setup guide"
        description="How to get your WhatsApp Cloud API credentials — about 15 minutes."
      >
        {[
          { n: 1, text: "Go to developers.facebook.com → My Apps → Create App → type: Business." },
          { n: 2, text: "Add the WhatsApp product. You need a dedicated phone number not already on personal WhatsApp — a Jio/BSNL SIM costs ₹0–50." },
          { n: 3, text: "In your app → WhatsApp → API Setup: copy the Phone Number ID and WhatsApp Business Account ID." },
          { n: 4, text: "Go to Business Manager → Settings → System Users → Add → Generate Token. Add whatsapp_business_messaging permission. This is your Permanent Access Token." },
          { n: 5, text: "Paste all four values above and click Connect." },
        ].map((s, i) => (
          <div key={s.n} style={{
            display: "flex", gap: 12, padding: "12px 0",
            borderBottom: i < 4 ? "0.5px solid var(--rule)" : "none",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
              background: "var(--accent-muted)",
              border: "0.5px solid var(--accent-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600,
              color: "var(--accent-text)",
            }}>
              {s.n}
            </div>
            <p className="t-body" style={{ fontSize: 13, lineHeight: 1.65 }}>{s.text}</p>
          </div>
        ))}

        <a
          href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            marginTop: 14, fontSize: 13,
            color: "var(--accent-text)", textDecoration: "none",
            letterSpacing: "-0.005em",
          }}
        >
          <ExternalLink size={11} /> Official Meta documentation
        </a>
      </SettingsCard>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}