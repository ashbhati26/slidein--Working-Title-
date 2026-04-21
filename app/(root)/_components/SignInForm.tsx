"use client";

import { useSignIn, useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import AuthInput from "./AuthInput";
import GoogleButton from "./GoogleButton";
import { useAuthModal } from "../../components/providers/AuthModalProvider";

export default function SignInForm() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { signIn, setActive } = useSignIn() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clerk = useClerk() as any;
  const { close, switchMode } = useAuthModal();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);

  const busy = loading || googleLoad;

  /* ── Google OAuth ── */
  async function handleGoogle() {
    setGoogleLoad(true);
    setErrors({});
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy:            "oauth_google",
        redirectUrl:         `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/dashboard`,
      });
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      setErrors({ root: e?.errors?.[0]?.message ?? "Google sign-in failed. Try again." });
      setGoogleLoad(false);
    }
  }

  /* ── Email/password ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!email.trim())    errs.email    = "Email is required";
    if (!password.trim()) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn.create({ identifier: email.trim(), password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        close();
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const e    = err as { errors?: { code?: string; message?: string }[] };
      const code = e?.errors?.[0]?.code;
      if (code === "form_identifier_not_found")
        setErrors({ email: "No account found with this email" });
      else if (code === "form_password_incorrect")
        setErrors({ password: "Incorrect password" });
      else
        setErrors({ root: e?.errors?.[0]?.message ?? "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {errors.root && (
        <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 14, background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)" }}>
          <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>{errors.root}</p>
        </div>
      )}

      <GoogleButton onClick={handleGoogle} loading={googleLoad} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
        <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <AuthInput label="Email" type="email" placeholder="you@example.com"
          value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
          error={errors.email} autoComplete="email" autoFocus />
        <AuthInput label="Password" isPassword placeholder="••••••••"
          value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
          error={errors.password} autoComplete="current-password" />

        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%", height: 40, borderRadius: 8, marginTop: 4,
            background: busy ? "var(--rule-md)" : "var(--accent)",
            color: busy ? "var(--ink-3)" : "#fff",
            border: "none", fontSize: 13, fontWeight: 500,
            fontFamily: "var(--font-sans)",
            cursor: busy ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.15s ease",
          }}
        >
          {loading && <Loader2 size={14} style={{ animation: "spin .7s linear infinite" }} />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-3)", marginTop: 16 }}>
        Don't have an account?{" "}
        <button onClick={switchMode} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 12, fontWeight: 500, padding: 0 }}>
          Sign up free
        </button>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}