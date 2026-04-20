"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { LogOut, Sun, Moon, ChevronDown, LayoutDashboard, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthModal } from "../../components/providers/AuthModalProvider";

interface DropdownPos { top?: number; bottom?: number; left?: number; }

export default function UserDropdown() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut }         = useClerk();
  const { openSignIn }      = useAuthModal();
  const { theme, setTheme } = useTheme();

  const [open,       setOpen]       = useState(false);
  const [pos,        setPos]        = useState<DropdownPos>({});
  const [dropUp,     setDropUp]     = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted,    setMounted]    = useState(false);

  const triggerRef  = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  /* ── Position calculation ── */
  function calcPos() {
    if (!triggerRef.current) return;
    const W = 220, H = 280;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const goUp = vh - rect.bottom < H && rect.top > H;
    setDropUp(goUp);
    const newPos: DropdownPos = {};
    if (goUp) newPos.bottom = vh - rect.top + 6;
    else       newPos.top   = rect.bottom + 6;
    newPos.left = Math.max(8, Math.min(rect.right - W, vw - W - 8));
    setPos(newPos);
  }

  function openDropdown() {
    calcPos();
    setOpen(true);
  }

  function closeDropdown() {
    setOpen(false);
  }

  /* ── Close on outside pointer down — but NOT if the pointer is inside the dropdown ── */
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      const insideTrigger  = triggerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideTrigger && !insideDropdown) {
        setOpen(false);
      }
    }

    // Use pointerdown (works for mouse + touch) but delay by one frame
    // so the open click doesn't immediately re-close
    const id = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", handlePointerDown, true);
    });

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [open]);

  /* ── Close on scroll / resize ── */
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    setSigningOut(true);
    try {
      await signOut({ redirectUrl: "/" });
    } catch {
      window.location.href = "/";
    }
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
    setOpen(false);
  }

  /* ── Avatar ── */
  function Avatar() {
    if (user?.imageUrl) {
      return (
        <img
          src={user.imageUrl}
          alt={user.fullName ?? "Avatar"}
          style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "0.5px solid var(--rule-md)" }}
        />
      );
    }
    const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "?";
    return (
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 600, color: "var(--accent)",
      }}>
        {initials}
      </div>
    );
  }

  if (!isLoaded) {
    return <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--rule)", animation: "sk 1.6s ease-in-out infinite" }} />;
  }

  /* ── Dropdown panel — rendered via portal so it's never clipped ── */
  const dropdownPanel = open && mounted ? (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        width: 220,
        zIndex: 9999,
        background: "var(--bg)",
        border: "0.5px solid var(--rule-md)",
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.06)",
        overflow: "hidden",
        /* Subtle entrance via CSS — no framer-motion needed here */
        animation: "dd-in 0.12s ease-out",
        ...pos,
      }}
    >
      {/* User info */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "0.5px solid var(--rule)", background: "var(--bg-subtle)" }}>
        <Avatar />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
            {user?.fullName ?? user?.firstName ?? "User"}
          </p>
          <p style={{ fontSize: 10, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: "5px" }}>
        <Link
          href="/dashboard"
          onClick={closeDropdown}
          style={itemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LayoutDashboard size={13} /> Dashboard
        </Link>
        <Link
          href="/settings"
          onClick={closeDropdown}
          style={itemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Settings size={13} /> Settings
        </Link>

        <div style={{ height: "0.5px", background: "var(--rule)", margin: "4px 0" }} />

        <button
          onClick={toggleTheme}
          style={btnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{ ...btnStyle, color: "var(--red)", opacity: signingOut ? 0.5 : 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-muted)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={13} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      {isSignedIn ? (
        <div ref={triggerRef} style={{ position: "relative" }}>
          <button
            onClick={() => (open ? closeDropdown() : openDropdown())}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 6px", borderRadius: 8,
              background: "transparent", border: "none", cursor: "pointer",
            }}
          >
            <Avatar />
            <ChevronDown
              size={11}
              color="var(--ink-3)"
              style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }}
            />
          </button>
          {mounted && createPortal(dropdownPanel, document.body)}
        </div>
      ) : (
        <button
          onClick={openSignIn}
          style={{
            padding: "5px 13px", borderRadius: 8, fontSize: 13,
            color: "var(--ink-2)", background: "transparent",
            border: "0.5px solid var(--rule-md)", cursor: "pointer",
          }}
        >
          Sign in
        </button>
      )}

      <style>{`
        @keyframes sk  { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes dd-in { from { opacity:0; transform:translateY(${dropUp ? "4px" : "-4px"}) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </>
  );
}

const itemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 9,
  padding: "8px 10px", borderRadius: 7, width: "100%",
  fontSize: 13, color: "var(--ink-2)", textDecoration: "none",
  background: "transparent", transition: "background 0.1s ease",
};

const btnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 9,
  padding: "8px 10px", borderRadius: 7, width: "100%",
  fontSize: 13, color: "var(--ink-2)",
  background: "transparent", border: "none",
  cursor: "pointer", textAlign: "left",
  transition: "background 0.1s ease",
};