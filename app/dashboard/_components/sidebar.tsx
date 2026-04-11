"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Zap, Users, Settings, Sun, Moon, ExternalLink,
} from "lucide-react";
import UserDropdown from "@/app/(root)/_components/UserDropdown";

const NAV = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Dashboard"   },
  { href: "/automations", icon: Zap,              label: "Automations" },
  { href: "/leads",       icon: Users,            label: "Leads"       },
  { href: "/settings",    icon: Settings,         label: "Settings"    },
];

export function Sidebar() {
  const path = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside style={{
      width: "var(--sidebar-w)",
      flexShrink: 0,
      height: "100dvh",
      background: "var(--bg-subtle)",
      borderRight: "0.5px solid var(--rule-md)",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        borderBottom: "0.5px solid var(--rule)",
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 17,
          fontWeight: 600,
          color: "var(--ink-1)",
          letterSpacing: "-0.03em",
        }}>
          SlideIN
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 32,
                padding: "0 10px",
                borderRadius: 7,
                marginBottom: 1,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? "var(--ink-1)" : "var(--ink-3)",
                background: active ? "var(--bg-hover)" : "transparent",
                textDecoration: "none",
                transition: "background 0.1s ease, color 0.1s ease",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--bg-hover)";
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
              <Icon size={14} />
              {label}
            </Link>
          );
        })}

        <div style={{ height: "0.5px", background: "var(--rule)", margin: "10px 4px" }} />

        <a
          href="/"
          target="_blank"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            height: 32, padding: "0 10px", borderRadius: 7,
            fontSize: 13, fontWeight: 400, color: "var(--ink-3)",
            textDecoration: "none", letterSpacing: "-0.01em",
            transition: "color 0.1s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-3)")}
        >
          <ExternalLink size={13} />
          View site
        </a>
      </nav>

      {/* Footer */}
      <div style={{
        padding: "10px 12px",
        borderTop: "0.5px solid var(--rule)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <UserDropdown />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            width: 26, height: 26, borderRadius: 6,
            border: "0.5px solid var(--rule-md)",
            background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ink-3)", cursor: "pointer",
            transition: "border-color 0.12s ease, color 0.12s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--ink-1)";
            e.currentTarget.style.color = "var(--ink-1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--rule-md)";
            e.currentTarget.style.color = "var(--ink-3)";
          }}
        >
          {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
        </button>
      </div>
    </aside>
  );
}