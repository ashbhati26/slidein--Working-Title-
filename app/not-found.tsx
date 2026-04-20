// FILE: app/not-found.tsx — Next.js 404 page
"use client";

import Link from "next/link";
import { Home, Zap, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-subtle)", padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>

        {/* Large 404 */}
        <div style={{
          fontSize: "clamp(80px, 15vw, 120px)", fontWeight: 600,
          color: "var(--rule-md)", letterSpacing: "-0.06em",
          lineHeight: 1, marginBottom: 8, fontFamily: "var(--font-sans)",
          userSelect: "none",
        }}>
          404
        </div>

        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Zap size={22} color="var(--accent)" />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.03em", marginBottom: 10 }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.65, marginBottom: 32, letterSpacing: "-0.01em" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions — CSS hover via className */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="nf-btn-primary">
            <Home size={13} /> Go home
          </Link>
          <Link href="/dashboard" className="nf-btn-secondary">
            <Zap size={13} /> Dashboard
          </Link>
        </div>

        {/* Back button */}
        <button
          onClick={() => history.back()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            marginTop: 20, fontSize: 12, color: "var(--ink-3)",
            background: "none", border: "none", cursor: "pointer",
            letterSpacing: "-0.005em",
          }}
        >
          <ArrowLeft size={12} /> Go back
        </button>

      </div>

      <style>{`
        .nf-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          height: 38px; padding: 0 20px; border-radius: 980px;
          background: var(--accent); color: #fff;
          text-decoration: none; font-size: 13px; font-weight: 400;
          letter-spacing: -0.01em; transition: opacity 0.15s ease;
        }
        .nf-btn-primary:hover { opacity: 0.85; }
        .nf-btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          height: 38px; padding: 0 20px; border-radius: 980px;
          background: var(--bg); color: var(--ink-2);
          border: 0.5px solid var(--rule-md);
          text-decoration: none; font-size: 13px; font-weight: 400;
          letter-spacing: -0.01em; transition: all 0.12s ease;
        }
        .nf-btn-secondary:hover { border-color: var(--ink-3); color: var(--ink-1); }
      `}</style>
    </div>
  );
}