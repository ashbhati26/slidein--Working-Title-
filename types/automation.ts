import { Doc, Id } from "@/convex/_generated/dataModel";

/* ─── Re-export Convex doc types ──────────────────────────── */
export type Account = Doc<"accounts">;
export type Automation = Doc<"automations">;
export type Lead = Doc<"leads">;
export type Conversation = Doc<"conversations">;
export type DripJob = Doc<"drip_jobs">;
export type Referral = Doc<"referrals">;
export type WebhookLog = Doc<"webhook_logs">;

/* ─── ID types ────────────────────────────────────────────── */
export type AccountId = Id<"accounts">;
export type AutomationId = Id<"automations">;
export type LeadId = Id<"leads">;
export type ConversationId = Id<"conversations">;
export type DripJobId = Id<"drip_jobs">;

/* ─── Plan ────────────────────────────────────────────────── */
export type Plan = "starter" | "creator" | "smart_ai";

/* ─── Channel ─────────────────────────────────────────────── */
export type Channel = "instagram" | "whatsapp";

/* ─── Automation status ───────────────────────────────────── */
export type AutomationStatus = "active" | "paused" | "draft";

/* ─── Trigger types ───────────────────────────────────────── */
export type TriggerType = "ig_comment" | "ig_dm" | "wa_message";
export type KeywordMatchType = "exact" | "contains" | "fuzzy";

/* ─── Listener types ──────────────────────────────────────── */
export type ListenerType = "fixed_message" | "smart_ai";

/* ─── Lead status ─────────────────────────────────────────── */
export type LeadStatus =
  | "new"
  | "in_conversation"
  | "qualified"
  | "converted"
  | "opted_out"
  | "lost";

/* ─── Drip status ─────────────────────────────────────────── */
export type DripStatus = "none" | "running" | "stopped" | "completed";

/* ─── Message role + source ───────────────────────────────── */
export type MessageRole = "user" | "assistant" | "system";
export type MessageSource = "trigger" | "ai" | "drip" | "human" | "inbound";
export type DeliveryStatus = "pending" | "sent" | "delivered" | "read" | "failed";

/* ─── AI language ─────────────────────────────────────────── */
export type AILanguage =
  | "english"
  | "hindi"
  | "hinglish"
  | "tamil"
  | "telugu"
  | "marathi";

/* ─── Form types for creating/editing automations ─────────── */
export interface CreateAutomationInput {
  name: string;
  channel: Channel;
  trigger: {
    type: TriggerType;
    keywords: string[];
    keywordMatchType: KeywordMatchType;
    excludeKeywords?: string[];
    igPostIds?: string[];
    activeHoursStart?: string;
    activeHoursEnd?: string;
  };
  listener: {
    type: ListenerType;
    message?: {
      text?: string;
      mediaUrl?: string;
      mediaType?: "image" | "pdf" | "none";
      igPublicReply?: string;
      buttons?: Array<{ id: string; title: string }>;
    };
    aiConfig?: {
      language: AILanguage;
      tone: string;
      businessDescription: string;
      faqs: Array<{ question: string; answer: string }>;
      paymentLink?: string;
      discountInstruction?: string;
      escalationPhrase?: string;
    };
  };
  drip?: {
    enabled: boolean;
    steps: Array<{
      stepNumber: number;
      delayHours: number;
      message: string;
      mediaUrl?: string;
      mediaType?: "image" | "pdf" | "none";
    }>;
    stopOnReply: boolean;
    stopKeywords?: string[];
  };
}

/* ─── Template definition ─────────────────────────────────── */
export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  vertical: string;
  icon: string;
  defaultKeywords: string[];
  channel: Channel;
  listenerType: ListenerType;
  previewMessage: string;
  planRequired: Plan;
}

/* ─── Dashboard stats ─────────────────────────────────────── */
export interface DashboardStats {
  totalAutomations: number;
  activeAutomations: number;
  totalLeads: number;
  leadsThisPeriod: number;
  totalMessagesSent: number;
  conversionRate: number;
}

/* ─── Automation with computed fields for UI ──────────────── */
export interface AutomationWithStats extends Automation {
  leadsToday: number;
  isRateLimited: boolean;
}

/* ─── Lead with last message for inbox view ───────────────── */
export interface LeadWithLastMessage extends Lead {
  lastMessage?: Conversation;
  unreadCount: number;
}

/* ─── Gemini message format ───────────────────────────────── */
export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}