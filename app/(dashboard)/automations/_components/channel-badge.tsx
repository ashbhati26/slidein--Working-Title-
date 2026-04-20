import { Camera, Phone } from "lucide-react";

export function ChannelBadge({ channel }: { channel: "instagram" | "whatsapp" }) {
  const isIG = channel === "instagram";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 99,
      background: "var(--bg-subtle)", border: "0.5px solid var(--rule-md)",
      fontSize: 10, color: "var(--ink-3)",
    }}>
      {isIG ? <Camera size={9} color="#E1306C" /> : <Phone size={9} color="#25D366" />}
      {isIG ? "Instagram" : "WhatsApp"}
    </div>
  );
}