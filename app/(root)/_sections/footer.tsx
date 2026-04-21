import Link from "next/link";

const LINKS: Record<
  string,
  { label: string; href: string; external?: boolean }[]
> = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Templates", href: "#features" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Support: [
    { label: "Documentation", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
    { label: "Referral Program", href: "/referral" },
    {
      label: "WhatsApp Support",
      href: "https://wa.me/919999999999",
      external: true,
    },
    { label: "Email us", href: "mailto:support@Svation.com" },
  ],
};

export function Footer() {
  return (
    <footer
      style={{ background: "var(--bg)", borderTop: "0.5px solid var(--rule)" }}
    >
      <style>{`
        .footer-link {
          display: block; padding: 4px 0;
          font-size: 13px; font-weight: 400;
          color: var(--ink-3); text-decoration: none;
          transition: color 0.12s ease; line-height: 1.6;
          letter-spacing: -0.01em;
        }
        .footer-link:hover { color: var(--ink-1); }
      `}</style>

      <div className="container" style={{ padding: "52px 24px 32px" }}>
        {/* Main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 44,
          }}
          className="footer-main"
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginBottom: 14,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  color: "var(--ink-1)",
                  letterSpacing: "-0.04em",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Svation
              </span>
            </Link>
            <p
              style={{
                fontSize: 13,
                color: "var(--ink-3)",
                lineHeight: 1.65,
                maxWidth: 200,
                marginBottom: 14,
                letterSpacing: "-0.01em",
              }}
            >
              WhatsApp and Instagram automation for Indian creators and SMBs.
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                letterSpacing: "-0.005em",
              }}
            >
              Made in India 🇮🇳
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([cat, links]) => (
            <div key={cat}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--ink-1)",
                  marginBottom: 14,
                }}
              >
                {cat}
              </p>
              {links.map((l) =>
                l.external ? (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                  >
                    {l.label}
                  </a>
                ) : l.href.startsWith("mailto") ? (
                  <a key={l.label} href={l.href} className="footer-link">
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.label} href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            height: "0.5px",
            background: "var(--rule)",
            marginBottom: 18,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              letterSpacing: "-0.005em",
            }}
          >
            © {new Date().getFullYear()} Svation by Script Valley. All rights
            reserved.
          </span>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
              Powered by Meta WhatsApp Cloud API
            </span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
              AI by Google Gemini
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) { .footer-main { grid-template-columns: 1fr 1fr 1fr !important; } }
        @media (max-width: 560px) { .footer-main { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </footer>
  );
}
