import { Camera, Phone } from "lucide-react";

interface LeadAvatarProps {
  username?:      string;
  profilePicUrl?: string;
  channel:        "instagram" | "whatsapp";
  size?:          number;
}

export function LeadAvatar({ username, profilePicUrl, channel, size = 36 }: LeadAvatarProps) {
  const initial = (username?.[0] ?? "?").toUpperCase();
  const isIG    = channel === "instagram";

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {profilePicUrl ? (
        <img
          src={profilePicUrl}
          alt={username ?? "Lead"}
          style={{
            width: size, height: size, borderRadius: "50%",
            objectFit: "cover",
            border: "0.5px solid var(--rule-md)",
          }}
        />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: "50%",
          background: "var(--accent-muted)",
          border: "0.5px solid var(--accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.38, fontWeight: 600,
          color: "var(--accent)",
          letterSpacing: "-0.01em",
        }}>
          {initial}
        </div>
      )}

      {/* Channel badge */}
      <div style={{
        position: "absolute", bottom: -1, right: -1,
        width: 14, height: 14, borderRadius: "50%",
        background: isIG ? "#E1306C" : "#25D366",
        border: "1.5px solid var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isIG
          ? <Camera size={7} color="#fff" />
          : <Phone  size={7} color="#fff" />
        }
      </div>
    </div>
  );
}