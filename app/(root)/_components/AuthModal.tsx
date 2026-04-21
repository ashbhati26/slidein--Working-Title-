"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthModal } from "../../components/providers/AuthModalProvider";

export default function AuthModal() {
  const { isOpen, mode, close, switchMode } = useAuthModal();

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
              position: "fixed", inset: 0, zIndex: 200,
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
              position: "fixed", inset: 0, zIndex: 201,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 16px",
              pointerEvents: "none",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ pointerEvents: "auto", position: "relative" }}
            >
              {/* Close button */}
              <button
                onClick={close}
                style={{
                  position: "absolute", top: 12, right: 12, zIndex: 10,
                  width: 28, height: 28, borderRadius: 999,
                  border: "1px solid var(--rule-md)",
                  background: "var(--bg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ink-3)", cursor: "pointer",
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

              {/* Clerk default components */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "signIn" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "signIn" ? 10 : -10 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                >
                  {mode === "signIn" ? (
                    <SignIn
                      routing="hash"
                      forceRedirectUrl="/dashboard"
                      appearance={{
                        elements: {
                          rootBox: { width: "100%" },
                          card: {
                            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                            borderRadius: "20px",
                            border: "1px solid var(--rule)",
                          },
                          footerAction: { display: "none" },
                        },
                      }}
                    />
                  ) : (
                    <SignUp
                      routing="hash"
                      forceRedirectUrl="/dashboard"
                      appearance={{
                        elements: {
                          rootBox: { width: "100%" },
                          card: {
                            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                            borderRadius: "20px",
                            border: "1px solid var(--rule)",
                          },
                          footerAction: { display: "none" },
                        },
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Switch mode */}
              <p style={{
                textAlign: "center", fontSize: 13,
                color: "var(--ink-3)", marginTop: 12,
              }}>
                {mode === "signIn" ? (
                  <>Don't have an account?{" "}
                    <button
                      onClick={switchMode}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 13, fontWeight: 500, padding: 0 }}
                    >
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <button
                      onClick={switchMode}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 13, fontWeight: 500, padding: 0 }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}