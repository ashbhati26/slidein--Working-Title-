"use client";

import { create } from "zustand";

interface UIStore {
  /* ── Sidebar ────────────────────────────────────────────── */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;

  /* ── Mobile bottom sheet / drawer ──────────────────────── */
  activeSheet: string | null;
  openSheet: (id: string) => void;
  closeSheet: () => void;

  /* ── Global command palette ─────────────────────────────── */
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;

  /* ── Upgrade modal ──────────────────────────────────────── */
  upgradeModalOpen: boolean;
  upgradeModalFeature: string | null;
  openUpgradeModal: (feature?: string) => void;
  closeUpgradeModal: () => void;

  /* ── Connect channel modal ──────────────────────────────── */
  connectChannelModal: "instagram" | "whatsapp" | null;
  openConnectChannel: (channel: "instagram" | "whatsapp") => void;
  closeConnectChannel: () => void;

  /* ── Toast / notification count (unread leads) ──────────── */
  unreadLeadCount: number;
  setUnreadLeadCount: (n: number) => void;
  incrementUnreadLeads: () => void;
  clearUnreadLeads: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  /* Sidebar */
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  /* Sheet */
  activeSheet: null,
  openSheet: (id) => set({ activeSheet: id }),
  closeSheet: () => set({ activeSheet: null }),

  /* Command palette */
  commandOpen: false,
  setCommandOpen: (v) => set({ commandOpen: v }),

  /* Upgrade modal */
  upgradeModalOpen: false,
  upgradeModalFeature: null,
  openUpgradeModal: (feature) =>
    set({ upgradeModalOpen: true, upgradeModalFeature: feature ?? null }),
  closeUpgradeModal: () =>
    set({ upgradeModalOpen: false, upgradeModalFeature: null }),

  /* Connect channel */
  connectChannelModal: null,
  openConnectChannel: (channel) => set({ connectChannelModal: channel }),
  closeConnectChannel: () => set({ connectChannelModal: null }),

  /* Unread leads */
  unreadLeadCount: 0,
  setUnreadLeadCount: (n) => set({ unreadLeadCount: n }),
  incrementUnreadLeads: () =>
    set((s) => ({ unreadLeadCount: s.unreadLeadCount + 1 })),
  clearUnreadLeads: () => set({ unreadLeadCount: 0 }),
}));