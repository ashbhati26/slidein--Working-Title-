import Link from "next/link";

const LINKS: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features",     href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing",      href: "#pricing" },
    { label: "Templates",    href: "#features" },
  ],
  Company: [
    { label: "About",   href: "#" },
    { label: "Blog",    href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Refund Policy",    href: "#" },
  ],
  Support: [
    { label: "WhatsApp Support",  href: "#" },
    { label: "Documentation",    href: "#" },
    { label: "Referral Program", href: "#" },
    { label: "Status",           href: "#" },
  ],
};

export function Footer() {
  return (
    <footer style={{ background: "var(--bg)", borderTop: "0.5px solid var(--rule)" }}>
      <style>{`
        .footer-link {
          display: block;
          padding: 5px 0;
          font-size: 13px;
          font-weight: 400;
          color: var(--ink-3);
          text-decoration: none;
          transition: color 0.15s ease;
          line-height: 1.6;
          letter-spacing: -0.01em;
        }
        .footer-link:hover { color: var(--ink-1); }
      `}</style>

      <div className="container" style={{ padding: "52px 24px 32px" }}>
        {/* Main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 48,
          }}
          className="footer-main"
        >
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "inline-block", marginBottom: 14, textDecoration: "none" }}>
              <span style={{
                fontSize: 20,
                fontWeight: 600,
                color: "var(--ink-1)",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-sans)",
              }}>
                SlideIN
              </span>
            </Link>
            <p style={{
              fontSize: 13, fontWeight: 400, color: "var(--ink-3)",
              lineHeight: 1.6, maxWidth: 200, marginBottom: 16,
              letterSpacing: "-0.01em",
            }}>
              WhatsApp and Instagram automation for Indian creators and SMBs.
            </p>
            <p style={{ fontSize: 12, fontWeight: 400, color: "var(--ink-3)", letterSpacing: "0.02em" }}>
              Made in India
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([cat, links]) => (
            <div key={cat}>
              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "var(--ink-1)", marginBottom: 14,
              }}>
                {cat}
              </p>
              {links.map((l) => (
                <a key={l.label} href={l.href} className="footer-link">
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ height: "0.5px", background: "var(--rule)", marginBottom: 20 }} />
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}>
          <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink-3)", letterSpacing: "-0.01em" }}>
            Copyright © {new Date().getFullYear()} SlideIN. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 400, color: "var(--ink-3)" }}>
              Powered by Meta WhatsApp Cloud API
            </span>
            <span style={{ fontSize: 12, fontWeight: 400, color: "var(--ink-3)" }}>
              AI by OpenAI
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .footer-main { grid-template-columns: 1fr 1fr 1fr !important; } }
        @media (max-width: 600px) { .footer-main { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </footer>
  );
}