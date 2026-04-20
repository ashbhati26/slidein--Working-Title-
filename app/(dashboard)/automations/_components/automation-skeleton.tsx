function Sk({ w = "100%", h = 12, r = 5 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "var(--rule)", animation: "sk 1.6s ease-in-out infinite" }} />;
}

export function AutomationSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          padding: "16px 18px",
          borderBottom: i < 3 ? "0.5px solid var(--rule)" : "none",
          display: "flex", alignItems: "center", gap: 12,
          opacity: 1 - i * 0.15,
          // Round bottom corners on last skeleton row
          borderRadius: i === 3 ? "0 0 14px 14px" : 0,
        }}>
          <Sk w={6} h={6} r={99} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Sk w={130} h={12} r={4} />
              <Sk w={64}  h={16} r={99} />
            </div>
            <Sk w="48%" h={10} r={4} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Sk w={36} h={20} r={4} />
            <Sk w={36} h={20} r={4} />
          </div>
          <Sk w={36} h={20} r={99} />
        </div>
      ))}
      <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </>
  );
}