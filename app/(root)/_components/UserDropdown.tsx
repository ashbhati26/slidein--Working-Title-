"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Sun, Moon, ChevronDown, LayoutDashboard, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthModal } from "../../components/providers/AuthModalProvider";

interface DropdownPos { top?: number; bottom?: number; left?: number; }

export default function UserDropdown() {
  const { user, isLoaded, isSignedIn }  = useUser();
  const { signOut }         = useClerk();
  const { openSignIn }      = useAuthModal();
  const { theme, setTheme } = useTheme();

  const [open,   setOpen]   = useState(false);
  const [pos,    setPos]    = useState<DropdownPos>({});
  const [dropUp, setDropUp] = useState(false);
  const triggerRef          = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Close on scroll/resize */
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

  /* Position dropdown */
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const W = 220, H = 280;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const goUp = vh - rect.bottom < H && rect.top > H;
    setDropUp(goUp);
    const newPos: DropdownPos = {};
    if (goUp) newPos.bottom = vh - rect.top + 6;
    else       newPos.top    = rect.bottom + 6;
    newPos.left = Math.max(8, Math.min(rect.right - W, vw - W - 8));
    setPos(newPos);
  }, [open]);

  /* Avatar */
  function Avatar() {
    if (user?.imageUrl) {
      return (
        <img
          src={user.imageUrl}
          alt={user.fullName ?? "Avatar"}
          style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--rule-md)" }}
        />
      );
    }
    const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "?";
    return (
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: "var(--accent-muted)", border: "1px solid var(--accent-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 600, color: "var(--accent)",
      }}>
        {initials}
      </div>
    );
  }

  if (!isLoaded) {
    return <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--rule)", animation: "pulse 1.6s ease-in-out infinite" }} />;
  }

  const dropdownPanel = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: dropUp ? -6 : 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: dropUp ? -6 : 6, scale: 0.97 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{
            position: "fixed", width: 220, zIndex: 300,
            background: "var(--bg-card)",
            border: "1px solid var(--rule)",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,.12)",
            overflow: "hidden",
            ...pos,
          }}
        >
          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid var(--rule)", background: "var(--bg-subtle)" }}>
            <Avatar />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.fullName ?? user?.firstName ?? "User"}
              </p>
              <p style={{ fontSize: 10, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div style={{ padding: "6px 6px" }}>
            <Link href="/dashboard" onClick={() => setOpen(false)} style={menuItemStyle}>
              <LayoutDashboard size={13} />
              Dashboard
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)} style={menuItemStyle}>
              <Settings size={13} />
              Settings
            </Link>

            <div style={{ height: 1, background: "var(--rule)", margin: "4px 4px" }} />

            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={menuBtnStyle}>
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>

            <button
              onClick={async () => { setOpen(false); await signOut(); }}
              style={{ ...menuBtnStyle, color: "#f87171" }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {isSignedIn ? (
        <div ref={triggerRef} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((p) => !p)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 6px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Avatar />
            <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none" }} />
          </button>
          {typeof document !== "undefined" && createPortal(dropdownPanel, document.body)}
        </div>
      ) : (
        <button
          onClick={openSignIn}
          style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, color: "var(--ink-2)", background: "transparent", border: "1px solid var(--rule-md)", cursor: "pointer" }}
        >
          Sign in
        </button>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 9,
  padding: "8px 10px", borderRadius: 7, width: "100%",
  fontSize: 13, color: "var(--ink-2)",
  textDecoration: "none",
};

const menuBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 9,
  padding: "8px 10px", borderRadius: 7, width: "100%",
  fontSize: 13, color: "var(--ink-2)",
  background: "transparent", border: "none", cursor: "pointer",
  textAlign: "left",
};