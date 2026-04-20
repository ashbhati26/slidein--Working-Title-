import { Sk } from "./dash-skeleton";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  loading: boolean;
  accent?: boolean;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  loading,
  accent,
}: StatCardProps) {
  return (
    <div
      style={{
        padding: "22px 22px 20px",
        background: accent ? "var(--accent)" : "var(--bg)",
        border: accent ? "none" : "0.5px solid var(--rule-md)",
        borderRadius: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle icon watermark */}
      <div
        style={{
          position: "absolute",
          bottom: -8,
          right: -8,
          opacity: accent ? 0.07 : 0.04,
          pointerEvents: "none",
        }}
      >
        <Icon size={72} color={accent ? "#fff" : "var(--ink-1)"} />
      </div>

      <div style={{ position: "relative" }}>
        {/* Icon + label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: accent
                ? "rgba(255,255,255,0.15)"
                : "var(--bg-subtle)",
              border: accent ? "none" : "0.5px solid var(--rule-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={12} color={accent ? "#fff" : "var(--ink-3)"} />
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: accent ? "rgba(255,255,255,0.65)" : "var(--ink-3)",
              letterSpacing: "-0.005em",
            }}
          >
            {label}
          </span>
        </div>

        {loading ? (
          <>
            <Sk h={34} w="55%" r={6} />
            <div style={{ marginTop: 8 }}>
              <Sk h={11} w="70%" r={4} />
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "clamp(30px, 3vw, 38px)",
                fontWeight: 600,
                color: accent ? "#fff" : "var(--ink-1)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: 8,
                fontFamily: "var(--font-sans)",
              }}
            >
              {value}
            </div>
            <p
              style={{
                fontSize: 12,
                color: accent ? "rgba(255,255,255,0.5)" : "var(--ink-3)",
                letterSpacing: "-0.005em",
              }}
            >
              {sub}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
