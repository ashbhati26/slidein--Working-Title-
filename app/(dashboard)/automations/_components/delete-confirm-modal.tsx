"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean; name: string; loading: boolean;
  onConfirm: () => void; onCancel: () => void;
}

export function DeleteConfirmModal({ isOpen, name, loading, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            onClick={onCancel}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)" }}
          />
          <motion.div key="modal" initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", pointerEvents: "none" }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, background: "var(--bg)", border: "0.5px solid var(--rule-md)", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,.15)", padding: "22px", pointerEvents: "auto" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--red-muted)", border: "0.5px solid var(--red-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Trash2 size={15} color="var(--red)" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.01em", marginBottom: 6 }}>Delete automation?</p>
              <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, marginBottom: 20 }}>
                <strong style={{ color: "var(--ink-2)", fontWeight: 500 }}>{name}</strong> will be permanently deleted. All leads and drip sequences stop. Cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={onCancel} disabled={loading} style={{ flex: 1, height: 34, borderRadius: 8, fontSize: 12, background: "transparent", color: "var(--ink-2)", border: "0.5px solid var(--rule-md)", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={onConfirm} disabled={loading} style={{ flex: 1, height: 34, borderRadius: 8, fontSize: 12, background: "var(--red)", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1 }}>
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