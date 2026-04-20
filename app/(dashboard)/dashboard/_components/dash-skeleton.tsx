export function Sk({
  w = "100%",
  h = 14,
  r = 6,
}: {
  w?: string | number;
  h?: number;
  r?: number;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "var(--rule-md)",
        animation: "sk 1.6s ease-in-out infinite",
      }}
    />
  );
}
