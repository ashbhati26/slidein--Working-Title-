"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Users,
  Settings,
  BarChart2,
  ExternalLink,
  GitBranch,
} from "lucide-react";
import UserDropdown from "@/app/(root)/_components/UserDropdown";

const NAV_PRIMARY = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/automations", icon: Zap, label: "Automations" },
  { href: "/leads", icon: Users, label: "Leads" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
];

const NAV_SECONDARY = [
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/referral", icon: GitBranch, label: "Referral" },
];

export function Sidebar() {
  const path = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return path === href;
    return path.startsWith(href);
  }

  function NavLink({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          height: 34,
          padding: "0 10px",
          borderRadius: 8,
          marginBottom: 1,
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          color: active ? "var(--ink-1)" : "var(--ink-3)",
          background: active ? "var(--bg)" : "transparent",
          boxShadow: active
            ? "0 1px 3px rgba(0,0,0,0.06), 0 0 0 0.5px var(--rule-md)"
            : "none",
          textDecoration: "none",
          letterSpacing: "-0.01em",
          transition: "all 0.12s ease",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = "rgba(0,0,0,0.03)";
            e.currentTarget.style.color = "var(--ink-2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--ink-3)";
          }
        }}
      >
        <Icon
          size={14}
          color={active ? "var(--accent)" : "var(--ink-3)"}
          strokeWidth={active ? 2 : 1.5}
        />
        {label}
      </Link>
    );
  }

  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        flexShrink: 0,
        height: "100dvh",
        background: "var(--bg-subtle)",
        borderRight: "0.5px solid var(--rule-md)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          borderBottom: "0.5px solid var(--rule)",
          flexShrink: 0,
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "var(--ink-1)",
              letterSpacing: "-0.04em",
              fontFamily: "var(--font-sans)",
            }}
          >
            Svation
          </span>
        </Link>
      </div>

      {/* Primary nav */}
      <nav style={{ padding: "10px 8px 0", flexShrink: 0 }}>
        {NAV_PRIMARY.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Secondary nav */}
      <nav style={{ padding: "0 8px 8px" }}>
        <div
          style={{
            height: "0.5px",
            background: "var(--rule)",
            margin: "0 4px 8px",
          }}
        />
        {NAV_SECONDARY.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <a
          href="/"
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            height: 34,
            padding: "0 10px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 400,
            color: "var(--ink-3)",
            textDecoration: "none",
            letterSpacing: "-0.01em",
            transition: "color 0.12s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-3)")}
        >
          <ExternalLink size={14} strokeWidth={1.5} />
          View site
        </a>
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "0.5px solid var(--rule)",
          flexShrink: 0,
        }}
      >
        <UserDropdown />
      </div>
    </aside>
  );
}
