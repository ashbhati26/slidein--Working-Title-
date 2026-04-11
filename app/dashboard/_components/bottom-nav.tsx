"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Zap, Users, Settings } from "lucide-react";

const NAV = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Home"        },
  { href: "/automations", icon: Zap,              label: "Automations" },
  { href: "/leads",       icon: Users,            label: "Leads"       },
  { href: "/settings",    icon: Settings,         label: "Settings"    },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: 49,
      background: "var(--bg-subtle)",
      borderTop: "0.5px solid var(--rule-md)",
      display: "flex",
      alignItems: "center",
      zIndex: 50,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = path === href || (href !== "/dashboard" && path.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              height: "100%",
              textDecoration: "none",
              color: active ? "var(--accent)" : "var(--ink-3)",
              transition: "color 0.1s ease",
            }}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            <span style={{
              fontSize: 10,
              fontWeight: active ? 500 : 400,
              letterSpacing: "-0.005em",
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}