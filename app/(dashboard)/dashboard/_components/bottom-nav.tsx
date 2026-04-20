"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Zap, Users, Settings, BarChart2 } from "lucide-react";

const NAV = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Home"        },
  { href: "/automations", icon: Zap,              label: "Automations" },
  { href: "/leads",       icon: Users,            label: "Leads"       },
  { href: "/analytics",   icon: BarChart2,        label: "Analytics"   },
  { href: "/settings",    icon: Settings,         label: "Settings"    },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: 56,
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "saturate(180%) blur(20px)",
      WebkitBackdropFilter: "saturate(180%) blur(20px)",
      borderTop: "0.5px solid var(--rule-md)",
      display: "flex",
      alignItems: "stretch",
      zIndex: 50,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = href === "/dashboard" ? path === href : path.startsWith(href);
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
              textDecoration: "none",
              color: active ? "var(--accent)" : "var(--ink-3)",
              transition: "color 0.1s ease",
              position: "relative",
            }}
          >
            {/* Active indicator dot */}
            {active && (
              <div style={{
                position: "absolute",
                top: 6,
                width: 4, height: 4,
                borderRadius: "50%",
                background: "var(--accent)",
              }} />
            )}
            <Icon size={20} strokeWidth={active ? 2 : 1.5} />
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              letterSpacing: "-0.01em",
            }}>
              {label}
            </span>
          </Link>
        );
      })}

      <style>{`
        .dark nav[style] {
          background: rgba(0,0,0,0.72) !important;
        }
      `}</style>
    </nav>
  );
}