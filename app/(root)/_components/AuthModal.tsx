"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthModal } from "../../components/providers/AuthModalProvider";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthModal() {
  const { isOpen, mode, close } = useAuthModal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 201,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 16px",
              pointerEvents: "none",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 400,
                background: "var(--bg-card)",
                border: "1px solid var(--rule)",
                borderRadius: 20,
                overflow: "hidden",
                pointerEvents: "auto",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "24px 28px 20px",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div>
                  {/* Brand */}
                  <div style={{ marginBottom: 14 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 16,
                        color: "var(--ink-1)",
                        letterSpacing: "-0.025em",
                      }}
                    >
                      Svation
                    </span>
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 22,
                      fontWeight: 400,
                      color: "var(--ink-1)",
                      letterSpacing: "-0.025em",
                      marginBottom: 4,
                    }}
                  >
                    {mode === "signIn" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 300,
                      color: "var(--ink-3)",
                      lineHeight: 1.5,
                    }}
                  >
                    {mode === "signIn"
                      ? "Sign in to manage your automations."
                      : "Start automating your DMs for free."}
                  </p>
                </div>

                <button
                  onClick={close}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    border: "1px solid var(--rule-md)",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ink-3)",
                    cursor: "pointer",
                    flexShrink: 0,
                    marginTop: 2,
                    transition: "border-color 0.12s ease, color 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--ink-1)";
                    e.currentTarget.style.color = "var(--ink-1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--rule-md)";
                    e.currentTarget.style.color = "var(--ink-3)";
                  }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Form */}
              <div style={{ padding: "24px 28px 28px" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === "signIn" ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === "signIn" ? 10 : -10 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                  >
                    {mode === "signIn" ? <SignInForm /> : <SignUpForm />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
