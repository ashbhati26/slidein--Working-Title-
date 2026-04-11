"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:       string;
  error?:      string;
  isPassword?: boolean;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, isPassword, type, style, ...props }, ref) => {
    const [showPwd, setShowPwd] = useState(false);

    return (
      <div style={{ marginBottom: 14 }}>
        {/* Label */}
        <label style={{
          display: "block",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
          marginBottom: 7,
        }}>
          {label}
        </label>

        {/* Input wrapper */}
        <div style={{ position: "relative" }}>
          <input
            ref={ref}
            type={isPassword ? (showPwd ? "text" : "password") : type}
            {...props}
            style={{
              width: "100%",
              padding: isPassword ? "0 36px 0 14px" : "0 14px",
              height: 40,
              borderRadius: 999,
              border: `1px solid ${error ? "rgba(0,0,0,0.4)" : "var(--rule-md)"}`,
              background: "var(--bg)",
              color: "var(--ink-1)",
              fontSize: 13,
              fontWeight: 300,
              fontFamily: "var(--font-sans)",
              outline: "none",
              transition: "border-color 0.15s ease",
              boxSizing: "border-box",
              ...style,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--ink-1)";
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? "rgba(0,0,0,0.4)" : "var(--rule-md)";
              props.onBlur?.(e);
            }}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd((p) => !p)}
              style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--ink-3)", display: "flex", padding: 0,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink-1)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-3)")}
            >
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontSize: 11, color: "var(--ink-1)", marginTop: 5, lineHeight: 1.4, opacity: 0.6 }}>{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
export default AuthInput;