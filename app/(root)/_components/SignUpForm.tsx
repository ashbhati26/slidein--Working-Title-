"use client";

import { useSignUp, useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import AuthInput from "./AuthInput";
import GoogleButton from "./GoogleButton";
import { useAuthModal } from "../../components/providers/AuthModalProvider";

type Step = "form" | "verify";

export default function SignUpForm() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { signUp, setActive } = useSignUp() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clerk = useClerk() as any;
  const { close, switchMode } = useAuthModal();

  const [step,       setStep]      = useState<Step>("form");
  const [firstName,  setFirstName] = useState("");
  const [lastName,   setLastName]  = useState("");
  const [email,      setEmail]     = useState("");
  const [password,   setPassword]  = useState("");
  const [code,       setCode]      = useState("");
  const [errors,     setErrors]    = useState<Record<string, string>>({});
  const [loading,    setLoading]   = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);

  const busy = loading || googleLoad;

  /* ── Google OAuth ── */
  async function handleGoogle() {
    setGoogleLoad(true);
    setErrors({});
    try {
      await clerk.client.signUp.authenticateWithRedirect({
        strategy:            "oauth_google",
        redirectUrl:         `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/dashboard`,
      });
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      setErrors({ root: e?.errors?.[0]?.message ?? "Google sign-up failed. Try again." });
      setGoogleLoad(false);
    }
  }

  /* ── Email signup ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!firstName.trim())   errs.firstName = "First name is required";
    if (!email.trim())       errs.email     = "Email is required";
    if (password.length < 8) errs.password  = "Min. 8 characters";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      await signUp.create({
        firstName:    firstName.trim(),
        lastName:     lastName.trim() || undefined,
        emailAddress: email.trim(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const e    = err as { errors?: { code?: string; message?: string }[] };
      const code = e?.errors?.[0]?.code;
      if (code === "form_identifier_exists")
        setErrors({ email: "An account with this email already exists" });
      else if (code === "form_password_pwned" || code === "form_password_too_short")
        setErrors({ password: "Password is too weak. Choose a stronger one." });
      else
        setErrors({ root: e?.errors?.[0]?.message ?? "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  /* ── Email verify ── */
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) { setErrors({ code: "Code is required" }); return; }

    setLoading(true);
    setErrors({});

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        close();
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const e       = err as { errors?: { code?: string; message?: string }[] };
      const errCode = e?.errors?.[0]?.code;
      if (errCode === "form_code_incorrect")
        setErrors({ code: "Incorrect code — check your email" });
      else if (errCode === "verification_expired")
        setErrors({ code: "Code expired — go back and try again" });
      else
        setErrors({ root: e?.errors?.[0]?.message ?? "Verification failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setErrors({});
    } catch {
      setErrors({ root: "Could not resend code. Please try again." });
    }
  }

  /* ── Verify step ── */
  if (step === "verify") {
    return (
      <div>
        <button onClick={() => setStep("form")} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}>
          <ArrowLeft size={13} /> Back
        </button>
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-1)", marginBottom: 4 }}>Check your email</p>
        <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 20 }}>
          We sent a 6-digit code to <strong style={{ color: "var(--ink-2)" }}>{email}</strong>
        </p>
        {errors.root && (
          <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 14, background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)" }}>
            <p style={{ fontSize: 12, color: "#f87171" }}>{errors.root}</p>
          </div>
        )}
        <form onSubmit={handleVerify} noValidate>
          <AuthInput label="Verification code" type="text" inputMode="numeric" placeholder="123456"
            value={code} onChange={(e) => { setCode(e.target.value); setErrors({}); }}
            error={errors.code} autoComplete="one-time-code" autoFocus maxLength={6} />
          <button type="submit" disabled={loading} style={{
            width: "100%", height: 40, borderRadius: 8, marginTop: 4,
            background: loading ? "var(--rule-md)" : "var(--accent)",
            color: loading ? "var(--ink-3)" : "#fff",
            border: "none", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {loading && <Loader2 size={14} style={{ animation: "spin .7s linear infinite" }} />}
            {loading ? "Verifying…" : "Verify email"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-3)", marginTop: 16 }}>
          Didn't receive it?{" "}
          <button onClick={handleResend} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 12, fontWeight: 500, padding: 0 }}>
            Resend code
          </button>
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Form step ── */
  return (
    <div>
      {errors.root && (
        <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 14, background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)" }}>
          <p style={{ fontSize: 12, color: "#f87171" }}>{errors.root}</p>
        </div>
      )}

      <GoogleButton onClick={handleGoogle} loading={googleLoad} label="Sign up with Google" />

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
        <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <AuthInput label="First name" type="text" placeholder="Priya"
            value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: "" })); }}
            error={errors.firstName} autoComplete="given-name" autoFocus />
          <AuthInput label="Last name" type="text" placeholder="Sharma"
            value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
        </div>
        <AuthInput label="Email" type="email" placeholder="you@example.com"
          value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
          error={errors.email} autoComplete="email" />
        <AuthInput label="Password" isPassword placeholder="Min. 8 characters"
          value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
          error={errors.password} autoComplete="new-password" />

        <button type="submit" disabled={busy} style={{
          width: "100%", height: 40, borderRadius: 8, marginTop: 4,
          background: busy ? "var(--rule-md)" : "var(--accent)",
          color: busy ? "var(--ink-3)" : "#fff",
          border: "none", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)",
          cursor: busy ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all 0.15s ease",
        }}>
          {loading && <Loader2 size={14} style={{ animation: "spin .7s linear infinite" }} />}
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p style={{ textAlign: "center", fontSize: 10, color: "var(--ink-3)", marginTop: 10, lineHeight: 1.5 }}>
          By continuing you agree to our{" "}
          <a href="/terms" style={{ color: "var(--accent)" }}>Terms</a>{" "}and{" "}
          <a href="/privacy" style={{ color: "var(--accent)" }}>Privacy Policy</a>
        </p>
      </form>

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-3)", marginTop: 14 }}>
        Already have an account?{" "}
        <button onClick={switchMode} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 12, fontWeight: 500, padding: 0 }}>
          Sign in
        </button>
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}