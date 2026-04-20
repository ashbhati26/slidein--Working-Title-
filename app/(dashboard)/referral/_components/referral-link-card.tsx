"use client";

import { useState } from "react";
import { Link2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function ReferralLinkCard({ referralLink }: { referralLink: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    const text = `I use Svation to automate all my Instagram DMs and WhatsApp replies in 2 minutes. Sign up free: ${referralLink}`;
    if (navigator.share) {
      navigator.share({ text, url: referralLink });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Share text copied!");
    }
  }

  return (
    <div
      style={{
        background: "var(--accent)",
        borderRadius: 16,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 14,
        }}
      >
        <Link2 size={13} color="rgba(255,255,255,0.65)" />
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Your referral link
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 9,
          padding: "8px 12px",
          marginBottom: 10,
          border: "0.5px solid rgba(255,255,255,0.15)",
        }}
      >
        <p
          style={{
            flex: 1,
            fontSize: 12,
            color: "rgba(255,255,255,0.9)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
          }}
        >
          {referralLink || "Loading…"}
        </p>
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 10px",
            borderRadius: 6,
            background: copied
              ? "rgba(255,255,255,0.28)"
              : "rgba(255,255,255,0.18)",
            border: "none",
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
            letterSpacing: "-0.005em",
            transition: "background 0.12s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.26)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = copied
              ? "rgba(255,255,255,0.28)"
              : "rgba(255,255,255,0.18)")
          }
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <button
        onClick={handleShare}
        style={{
          width: "100%",
          padding: "9px",
          borderRadius: 9,
          background: "rgba(255,255,255,0.14)",
          border: "0.5px solid rgba(255,255,255,0.2)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 400,
          cursor: "pointer",
          letterSpacing: "-0.01em",
          transition: "background 0.12s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.14)")
        }
      >
        Share with your network
      </button>
    </div>
  );
}
