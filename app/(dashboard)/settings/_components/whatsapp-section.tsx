"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Phone, CheckCircle, Unlink, ExternalLink, Loader2, AlertCircle } from "lucide-react";
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

  const wa     = account?.whatsapp;
  const isPaid = limits?.plan !== "starter";

  if (account === undefined) return null;

  async function handleConnect() {
    const missing = [!phoneId.trim() && "Phone Number ID", !phone.trim() && "Display phone number", !wabaId.trim() && "WABA ID", !token.trim() && "Access token"].filter(Boolean);
    if (missing.length) { toast.error(`Missing: ${missing.join(", ")}`); return; }
    setSaving(true);
    try {
      await connectWA({ phoneNumberId: phoneId.trim(), displayPhoneNumber: phone.trim(), wabaId: wabaId.trim(), accessToken: token.trim() });
      toast.success("WhatsApp connected!");
      setShowForm(false);
      setPhoneId(""); setPhone(""); setWabaId(""); setToken("");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Failed to connect. Check your credentials.");
    } finally { setSaving(false); }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect WhatsApp? All WhatsApp automations will stop immediately.")) return;
    setDisconnecting(true);
    try {
      await disconnect({ channel: "whatsapp" });
      toast.success("WhatsApp disconnected.");
    } catch { toast.error("Failed to disconnect."); }
    finally  { setDisconnecting(false); }
  }

  if (!isPaid) {
    return (
      <SettingsCard title="WhatsApp" description="Automate your WhatsApp Business number.">
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(37,211,102,0.08)", border: "0.5px solid rgba(37,211,102,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Phone size={18} color="#25D366" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-1)", marginBottom: 5, letterSpacing: "-0.015em" }}>WhatsApp requires Creator plan</p>
          <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 18, maxWidth: 280, margin: "0 auto 18px", lineHeight: 1.6 }}>
            Upgrade to Creator (₹999/month) to connect your WhatsApp Business number.
          </p>
          <a href="/settings" style={{ height: 30, padding: "0 16px", borderRadius: 980, fontSize: 12, background: "var(--accent)", color: "#fff", border: "none", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            View billing
          </a>
        </div>
      </SettingsCard>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SettingsCard title="WhatsApp Business" description="Connect via Meta WhatsApp Cloud API — no third-party BSP, no extra cost.">
        {wa ? (
          /* Connected */
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "var(--green-muted)", border: "0.5px solid var(--green-border)", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "rgba(37,211,102,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Phone size={16} color="#25D366" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <CheckCircle size={12} color="var(--green)" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>{wa.displayPhoneNumber}</span>
                  {wa.verifiedName && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>· {wa.verifiedName}</span>}
                </div>
                <p style={{ fontSize: 11, color: "var(--ink-3)" }}>Daily limit: {(wa.messagingLimit ?? 250).toLocaleString("en-IN")} numbers</p>
              </div>
            </div>
            <button onClick={handleDisconnect} disabled={disconnecting}
              style={{ height: 30, padding: "0 14px", fontSize: 12, borderRadius: 980, border: "0.5px solid var(--red-border)", background: "var(--red-muted)", color: "var(--red)", display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", opacity: disconnecting ? 0.6 : 1 }}>
              <Unlink size={12} />{disconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>

        ) : !showForm ? (
          /* Not connected */
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "var(--bg-subtle)", border: "0.5px solid var(--rule-md)", marginBottom: 14 }}>
              <AlertCircle size={12} color="var(--ink-3)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "var(--ink-3)" }}>No WhatsApp number connected. Follow the setup guide below.</p>
            </div>
            <button onClick={() => setShowForm(true)} style={{ height: 32, padding: "0 16px", fontSize: 12, borderRadius: 980, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}>
              Enter credentials
            </button>
          </div>

        ) : (
          /* Form */
          <div>
            <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 16, lineHeight: 1.55 }}>
              Get these from{" "}
              <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline" }}>Meta Developer Dashboard</a>
              {" "}→ your app → WhatsApp → API Setup.
            </p>
            {[
              { label: "Phone Number ID",                     key: "phoneId", val: phoneId, set: setPhoneId, ph: "Found in WhatsApp → API Setup" },
              { label: "Display Phone Number",                key: "phone",   val: phone,   set: setPhone,   ph: "+91 98765 43210"               },
              { label: "WhatsApp Business Account ID (WABA)", key: "wabaId",  val: wabaId,  set: setWabaId,  ph: "Your WABA ID"                  },
              { label: "Permanent System User Token",         key: "token",   val: token,   set: setToken,   ph: "EAAxxxxxxxxxxxxxxx"             },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={labelSt}>{f.label}</label>
                <input value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} disabled={saving} style={inputSt}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rule-md)")}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => setShowForm(false)} style={{ height: 32, padding: "0 14px", fontSize: 12, borderRadius: 980, background: "var(--bg-subtle)", color: "var(--ink-3)", border: "0.5px solid var(--rule-md)", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleConnect} disabled={saving} style={{ height: 32, padding: "0 14px", fontSize: 12, borderRadius: 980, background: "var(--accent)", color: "#fff", border: "none", cursor: saving ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                {saving && <Loader2 size={12} style={{ animation: "spin .7s linear infinite" }} />}
                {saving ? "Connecting…" : "Connect"}
              </button>
            </div>
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Setup guide" description="How to get your WhatsApp Cloud API credentials — about 15 minutes.">
        <div style={{ padding: "4px 0" }}>
          {[
            "Go to developers.facebook.com → My Apps → Create App → type: Business.",
            "Add the WhatsApp product. Use a dedicated phone number not already on personal WhatsApp — a Jio/BSNL SIM costs ₹0–50.",
            "In your app → WhatsApp → API Setup: copy the Phone Number ID and WhatsApp Business Account ID.",
            "Go to Business Manager → Settings → System Users → Add → Generate Token. Add whatsapp_business_messaging permission.",
            "Paste all four values above and click Connect.",
          ].map((text, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: i < 4 ? "0.5px solid var(--rule)" : "none" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1, background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--accent)" }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.65, letterSpacing: "-0.005em" }}>{text}</p>
            </div>
          ))}
        </div>
        <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
          <ExternalLink size={11} /> Official Meta documentation
        </a>
      </SettingsCard>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}