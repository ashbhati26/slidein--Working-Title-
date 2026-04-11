function Sk({ w = "100%", h = 14, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "var(--rule)",
      animation: "sk 1.6s ease-in-out infinite",
    }} />
  );
}

export function AutomationSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--rule)",
            display: "flex", alignItems: "center", gap: 14,
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {/* Status dot */}
          <Sk w={8} h={8} r={99} />

          {/* Content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sk w={140} h={13} r={4} />
              <Sk w={70} h={18} r={99} />
              <Sk w={60} h={18} r={99} />
            </div>
            <Sk w="55%" h={11} r={4} />
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 20 }}>
            <Sk w={40} h={24} r={4} />
            <Sk w={40} h={24} r={4} />
          </div>

          {/* Toggle */}
          <Sk w={36} h={20} r={99} />
        </div>
      ))}
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
    </>
  );
}