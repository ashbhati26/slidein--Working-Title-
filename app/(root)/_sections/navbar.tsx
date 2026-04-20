"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthModal } from "../../components/providers/AuthModalProvider";
import UserDropdown from "../_components/UserDropdown";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

function AutoOpenModal() {
  const { openSignIn } = useAuthModal();
  const searchParams = useSearchParams();
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    if (searchParams.get("sign_in") === "1") {
      triggered.current = true;
      setTimeout(() => openSignIn(), 200);
    }
  }, [searchParams, openSignIn]);

  return null;
}

export function Navbar() {
  const { isSignedIn } = useUser();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { openSignIn, openSignUp } = useAuthModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <AutoOpenModal />
      </Suspense>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 44,
          display: "flex",
          alignItems: "center",
          transition: "background 0.3s ease, border-color 0.3s ease",
          background: scrolled
            ? "rgba(255,255,255,0.72)"
            : "rgba(255,255,255,0.72)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: `0.5px solid ${scrolled ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.12)"}`,
        }}
        className="apple-nav"
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--ink-1)",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-sans)",
              }}
            >
              Svation
            </span>
          </Link>

          {/* Desktop nav */}
          <div
            className="hidden md:flex"
            style={{ alignItems: "center", gap: 0 }}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  padding: "0 14px",
                  fontSize: 12,
                  fontWeight: 400,
                  color: "var(--ink-2)",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                  letterSpacing: "-0.01em",
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--ink-1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--ink-2)")
                }
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop right */}
          <div
            className="hidden md:flex"
            style={{ alignItems: "center", gap: 8 }}
          >
            {!isSignedIn ? (
              <>
                <button
                  onClick={openSignIn}
                  style={{
                    padding: "0 14px",
                    fontSize: 12,
                    fontWeight: 400,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-2)",
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.15s ease",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--ink-1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--ink-2)")
                  }
                >
                  Sign in
                </button>
                <button
                  onClick={openSignUp}
                  style={{
                    height: 28,
                    padding: "0 14px",
                    fontSize: 12,
                    fontWeight: 400,
                    background: "var(--accent)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 980,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--accent)")
                  }
                >
                  Get started
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    height: 28,
                    padding: "0 14px",
                    fontSize: 12,
                    fontWeight: 400,
                    background: "var(--accent)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 980,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    letterSpacing: "-0.01em",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Dashboard
                </Link>
                <UserDropdown />
              </>
            )}
          </div>

          {/* Mobile */}
          <div
            className="flex md:hidden"
            style={{ alignItems: "center", gap: 8 }}
          >
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 28,
                height: 28,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--ink-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          pointerEvents: menuOpen ? "auto" : "none",
          opacity: menuOpen ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,.2)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setMenuOpen(false)}
        />
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 0,
            right: 0,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            borderBottom: "0.5px solid var(--rule-md)",
            padding: "16px 24px 24px",
          }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                fontSize: 17,
                fontWeight: 400,
                color: "var(--ink-1)",
                borderBottom: "0.5px solid var(--rule)",
                letterSpacing: "-0.02em",
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={() => {
                setMenuOpen(false);
                openSignIn();
              }}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 980,
                border: "1px solid var(--rule-md)",
                background: "transparent",
                fontSize: 15,
                fontWeight: 400,
                color: "var(--ink-1)",
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                openSignUp();
              }}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 980,
                background: "var(--accent)",
                color: "#ffffff",
                border: "none",
                fontSize: 15,
                fontWeight: 400,
                cursor: "pointer",
              }}
            >
              Get started
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .dark .apple-nav {
          background: rgba(0,0,0,0.72) !important;
          border-bottom-color: rgba(255,255,255,0.12) !important;
        }
        .dark .apple-nav + div > div:last-child {
          background: rgba(28,28,30,0.9) !important;
        }
      `}</style>
    </>
  );
}
