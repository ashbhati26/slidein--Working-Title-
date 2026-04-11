import React from "react";

export function Marquee({
  items,
  speed = 36,
  gap   = 48,
}: {
  items: React.ReactNode[];
  speed?: number;   // seconds for one full loop
  gap?:   number;   // px gap between items
}) {
  return (
    <div
      style={{
        overflow: "hidden",
        position: "relative",
        width: "100%",
        maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        style={{
          display:   "flex",
          width:     "max-content",
          animation: `marquee-scroll ${speed}s linear infinite`,
          willChange: "transform",
          gap,
        }}
      >
        {/* Duplicate for seamless loop */}
        {[...items, ...items].map((item, i) => (
          <div key={i} style={{ flexShrink: 0 }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}