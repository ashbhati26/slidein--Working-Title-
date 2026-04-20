function Sk({ w = "100%", h = 12, r = 5 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "var(--rule)",
      animation: "sk 1.6s ease-in-out infinite",
    }} />
  );
}

export function LeadListSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            display: "flex", alignItems: "center", gap: 11,
            padding: "11px 14px",
            borderBottom: "0.5px solid var(--rule)",
            opacity: 1 - i * 0.1,
          }}
        >
          <Sk w={36} h={36} r={99} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Sk w={100} h={11} r={4} />
              <Sk w={24} h={9}  r={4} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Sk w="55%" h={9} r={4} />
              <Sk w={44}  h={16} r={99} />
            </div>
          </div>
        </div>
      ))}
      <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </>
  );
}