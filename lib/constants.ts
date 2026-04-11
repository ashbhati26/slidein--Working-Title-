export const APP_NAME = "SlideIN";
export const APP_URL = "https://slidein.app";
export const SUPPORT_WHATSAPP = "https://wa.me/919999999999";

/* ─── Plan pricing ────────────────────────────────────────── */
export const PLAN_PRICES = {
  starter: 0,
  creator: 999,
  smart_ai: 2499,
} as const;

export const ANNUAL_DISCOUNT = 0.20;

/* ─── Free plan limits ────────────────────────────────────── */
export const FREE_AUTOMATION_LIMIT = 5;
export const FREE_LEAD_PERIOD_LIMIT = 500;
export const FREE_TEMPLATE_LIMIT = 2;

/* Rolling 30-day window in ms */
export const LEAD_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

/* ─── Automation limits ───────────────────────────────────── */
export const MAX_DRIP_STEPS = 5;
export const MAX_KEYWORDS_PER_AUTOMATION = 10;
export const MAX_QUICK_REPLY_BUTTONS = 3;
export const MAX_FAQ_ITEMS = 10;

/* ─── Instagram API ───────────────────────────────────────── */
export const IG_DM_RATE_LIMIT_SAFE = 200;
export const IG_DM_RATE_LIMIT_HARD = 750;
export const IG_DEDUP_WINDOW_HOURS = 24;
export const IG_WINDOW_MS = 24 * 60 * 60 * 1000;

/* ─── WhatsApp API ────────────────────────────────────────── */
export const WA_WINDOW_MS = 24 * 60 * 60 * 1000;
export const WA_MESSAGE_COST_MARKETING = 0.88;
export const WA_MESSAGE_COST_UTILITY = 0.13;
export const WA_MAX_BUTTONS = 3;
export const WA_INITIAL_DAILY_LIMIT = 250;

/* ─── Smart AI session ────────────────────────────────────── */
export const AI_SESSION_EXPIRY_DAYS = 30;
export const AI_SESSION_EXPIRY_MS = AI_SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
export const AI_MAX_HISTORY_MESSAGES = 50;
export const AI_MAX_TOKENS = 1024;
export const AI_TEMPERATURE = 0.7;

/* ─── Drip ────────────────────────────────────────────────── */
export const DRIP_MIN_DELAY_HOURS = 1;
export const DRIP_MAX_DELAY_HOURS = 168;
export const DRIP_STOP_KEYWORDS = [
  "STOP",
  "stop",
  "unsubscribe",
  "opt out",
  "band karo",
];

/* ─── Referral rewards ────────────────────────────────────── */
export const REFERRAL_REWARDS = [
  { referrals: 1,  freeMonths: 1,  commission: 0 },
  { referrals: 3,  freeMonths: 3,  commission: 0 },
  { referrals: 5,  freeMonths: 6,  commission: 0 },
  { referrals: 10, freeMonths: 0,  commission: 0.30 },
] as const;

/* ─── Supported languages ─────────────────────────────────── */
export const AI_LANGUAGES = [
  { value: "hinglish", label: "Hinglish", description: "Hindi + English mix (recommended)" },
  { value: "hindi",    label: "Hindi",    description: "Pure Hindi — Devanagari script" },
  { value: "english",  label: "English",  description: "Standard English" },
  { value: "tamil",    label: "Tamil",    description: "Tamil script" },
  { value: "telugu",   label: "Telugu",   description: "Telugu script" },
  { value: "marathi",  label: "Marathi",  description: "Marathi script" },
] as const;

export type AILanguage = (typeof AI_LANGUAGES)[number]["value"];

/* ─── Template IDs ────────────────────────────────────────── */
export const TEMPLATE_IDS = {
  FITNESS:     "fitness_coach",
  COURSE:      "course_creator",
  REAL_ESTATE: "real_estate",
  SELLER:      "instagram_seller",
  SALON:       "beauty_salon",
  FINANCE:     "finance_advisor",
} as const;

/* ─── Navigation ──────────────────────────────────────────── */
export const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",   icon: "LayoutDashboard" },
  { href: "/automations", label: "Automations", icon: "Zap" },
  { href: "/leads",       label: "Leads",       icon: "Users" },
  { href: "/analytics",   label: "Analytics",   icon: "BarChart2" },
  { href: "/settings",    label: "Settings",    icon: "Settings" },
] as const;

/* ─── Meta API ────────────────────────────────────────────── */
export const META_API_VERSION = "v21.0";
export const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

/* ─── Verify tokens — read inside Convex HTTP actions via env() */
export const WA_VERIFY_TOKEN =
  typeof process !== "undefined"
    ? (process.env.WHATSAPP_VERIFY_TOKEN ?? "")
    : "";

export const IG_VERIFY_TOKEN =
  typeof process !== "undefined"
    ? (process.env.INSTAGRAM_VERIFY_TOKEN ?? "")
    : "";

/* ─── Error messages ──────────────────────────────────────── */
export const ERRORS = {
  AUTOMATION_LIMIT: `You've reached the ${FREE_AUTOMATION_LIMIT} automation limit on the free plan. Upgrade to Creator for unlimited automations.`,
  LEAD_LIMIT: `You've reached ${FREE_LEAD_PERIOD_LIMIT} leads this month. Upgrade to Creator for unlimited contacts.`,
  WHATSAPP_NOT_CONNECTED: "Connect your WhatsApp number first to use this feature.",
  INSTAGRAM_NOT_CONNECTED: "Connect your Instagram account first.",
  SMART_AI_PLAN_REQUIRED: "Smart AI is available on the Smart AI plan. Upgrade to enable it.",
  CREATOR_PLAN_REQUIRED: "This feature requires the Creator plan or above.",
  GENERIC: "Something went wrong. Please try again.",
} as const;

/* ─── Success messages ────────────────────────────────────── */
export const SUCCESS = {
  AUTOMATION_CREATED: "Automation is live!",
  AUTOMATION_PAUSED: "Automation paused.",
  AUTOMATION_DELETED: "Automation deleted.",
  SETTINGS_SAVED: "Settings saved.",
  CHANNEL_CONNECTED: "Channel connected successfully.",
} as const;