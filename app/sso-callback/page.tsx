"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid var(--rule-md)",
          borderTopColor: "var(--accent)",
          animation: "spin 0.7s linear infinite",
          margin: "0 auto 12px",
        }} />
        <p style={{ fontSize: 13, color: "var(--ink-3)", fontFamily: "var(--font-sans)" }}>
          Completing sign in…
        </p>
      </div>
      <AuthenticateWithRedirectCallback />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}