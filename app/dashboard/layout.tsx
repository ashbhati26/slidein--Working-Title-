import { Sidebar }   from "./_components/sidebar";
import { BottomNav } from "./_components/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Desktop — sidebar + content */}
      <div className="hidden md:flex" style={{ height: "100dvh", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: "auto", background: "var(--bg-subtle)" }}>
          {children}
        </main>
      </div>

      {/* Mobile — full screen + bottom nav */}
      <div className="flex md:hidden" style={{ flexDirection: "column", minHeight: "100dvh" }}>
        <main style={{ flex: 1, overflowY: "auto", background: "var(--bg-subtle)", paddingBottom: 49 }}>
          {children}
        </main>
        <BottomNav />
      </div>
    </>
  );
}