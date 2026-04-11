"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen:      boolean;
  name:        string;
  loading:     boolean;
  onConfirm:   () => void;
  onCancel:    () => void;
}

export function DeleteConfirmModal({
  isOpen, name, loading, onConfirm, onCancel,
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="delete-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,.4)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal */}
          <motion.div
            key="delete-modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0,   scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "fixed", inset: 0, zIndex: 201,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 16px", pointerEvents: "none",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 360,
                background: "var(--bg-card)",
                border: "1px solid var(--rule)",
                borderRadius: 14,
                boxShadow: "0 20px 60px rgba(0,0,0,.15)",
                padding: "24px",
                pointerEvents: "auto",
              }}
            >
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--red-muted)", border: "1px solid var(--red-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Trash2 size={16} color="var(--red)" />
              </div>

              <h3 style={{
                fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 400,
                color: "var(--ink-1)", letterSpacing: "-0.015em", marginBottom: 8,
              }}>
                Delete automation?
              </h3>
              <p style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)", lineHeight: 1.55, marginBottom: 22 }}>
                <strong style={{ color: "var(--ink-2)" }}>{name}</strong> will be permanently deleted.
                All associated leads and drip sequences will stop. This cannot be undone.
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={onCancel}
                  disabled={loading}
                  style={{
                    flex: 1, padding: "9px", borderRadius: 8, fontSize: 13,
                    background: "transparent", color: "var(--ink-2)",
                    border: "1px solid var(--rule-md)", cursor: "pointer",
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  style={{
                    flex: 1, padding: "9px", borderRadius: 8, fontSize: 13,
                    background: "var(--red)", color: "#fff",
                    border: "none", cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.65 : 1,
                    transition: "opacity 0.12s ease",
                  }}
                >
                  {loading ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}