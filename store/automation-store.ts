"use client";

import { create } from "zustand";
import { CreateAutomationInput, Channel, ListenerType } from "@/types/automation";

/*
  Tracks the state of the 4-step "Create Automation" wizard.
  Persists across step navigation without hitting the database
  until the user hits "Go Live".
*/

export type WizardStep = 1 | 2 | 3 | 4;

interface AutomationStore {
  /* ── Wizard step ────────────────────────────────────────── */
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  /* ── Draft automation being built ───────────────────────── */
  draft: Partial<CreateAutomationInput>;
  setChannel: (channel: Channel) => void;
  setKeyword: (keyword: string) => void;
  setKeywords: (keywords: string[]) => void;
  setListenerType: (type: ListenerType) => void;
  setFixedMessage: (text: string) => void;
  setAiConfig: (config: Partial<CreateAutomationInput["listener"]["aiConfig"]>) => void;
  setDripEnabled: (enabled: boolean) => void;
  setDripSteps: (steps: NonNullable<CreateAutomationInput["drip"]>["steps"]) => void;
  setName: (name: string) => void;
  updateDraft: (partial: Partial<CreateAutomationInput>) => void;

  /* ── Reset ──────────────────────────────────────────────── */
  resetWizard: () => void;

  /* ── Optimistic UI state ────────────────────────────────── */
  isSubmitting: boolean;
  setSubmitting: (v: boolean) => void;
  submitError: string | null;
  setSubmitError: (err: string | null) => void;
}

const DEFAULT_DRAFT: Partial<CreateAutomationInput> = {
  channel: undefined,
  trigger: {
    type: "ig_comment",
    keywords: [],
    keywordMatchType: "exact",
  },
  listener: {
    type: "fixed_message",
    message: { text: "", mediaType: "none" },
  },
  drip: {
    enabled: false,
    steps: [],
    stopOnReply: true,
    stopKeywords: ["STOP", "stop"],
  },
};

export const useAutomationStore = create<AutomationStore>((set) => ({
  /* Step */
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((s) => ({ currentStep: Math.min(4, s.currentStep + 1) as WizardStep })),
  prevStep: () =>
    set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) as WizardStep })),

  /* Draft */
  draft: { ...DEFAULT_DRAFT },

  setChannel: (channel) =>
    set((s) => ({
      draft: {
        ...s.draft,
        channel,
        trigger: {
          ...s.draft.trigger!,
          type: channel === "whatsapp" ? "wa_message" : "ig_comment",
        },
      },
    })),

  setKeyword: (keyword) =>
    set((s) => ({
      draft: {
        ...s.draft,
        trigger: {
          ...s.draft.trigger!,
          keywords: [keyword],
        },
      },
    })),

  setKeywords: (keywords) =>
    set((s) => ({
      draft: {
        ...s.draft,
        trigger: { ...s.draft.trigger!, keywords },
      },
    })),

  setListenerType: (type) =>
    set((s) => ({
      draft: {
        ...s.draft,
        listener: { ...s.draft.listener!, type },
      },
    })),

  setFixedMessage: (text) =>
    set((s) => ({
      draft: {
        ...s.draft,
        listener: {
          ...s.draft.listener!,
          message: { ...s.draft.listener?.message, text },
        },
      },
    })),

  setAiConfig: (config) =>
    set((s) => ({
      draft: {
        ...s.draft,
        listener: {
          ...s.draft.listener!,
          aiConfig: {
            ...(s.draft.listener?.aiConfig ?? {
              language: "hinglish" as const,
              tone: "",
              businessDescription: "",
              faqs: [],
            }),
            ...config,
          },
        },
      },
    })),

  setDripEnabled: (enabled) =>
    set((s) => ({
      draft: {
        ...s.draft,
        drip: { ...s.draft.drip!, enabled },
      },
    })),

  setDripSteps: (steps) =>
    set((s) => ({
      draft: {
        ...s.draft,
        drip: { ...s.draft.drip!, steps },
      },
    })),

  setName: (name) =>
    set((s) => ({ draft: { ...s.draft, name } })),

  updateDraft: (partial) =>
    set((s) => ({ draft: { ...s.draft, ...partial } })),

  /* Reset */
  resetWizard: () =>
    set({
      currentStep: 1,
      draft: { ...DEFAULT_DRAFT },
      isSubmitting: false,
      submitError: null,
    }),

  /* Optimistic UI */
  isSubmitting: false,
  setSubmitting: (v) => set({ isSubmitting: v }),
  submitError: null,
  setSubmitError: (err) => set({ submitError: err }),
}));