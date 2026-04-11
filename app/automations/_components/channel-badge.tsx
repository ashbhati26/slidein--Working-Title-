import { Camera, Phone } from "lucide-react";

interface ChannelBadgeProps {
  channel: "instagram" | "whatsapp";
}

export function ChannelBadge({ channel }: ChannelBadgeProps) {
  const isIG = channel === "instagram";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 99,
      background: "var(--bg-subtle)",
      border: "1px solid var(--rule-md)",
      fontSize: 11, fontWeight: 400, color: "var(--ink-2)",
    }}>
      {isIG
        ? <Camera size={10} color="#E1306C" />
        : <Phone size={10} color="#25D366" />
      }
      {isIG ? "Instagram" : "WhatsApp"}
    </div>
  );
}