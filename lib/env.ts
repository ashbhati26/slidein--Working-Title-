/* ─── Convex ──────────────────────────────────────────────── */
export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

/* ─── Clerk ───────────────────────────────────────────────── */
export const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY ?? "";

/* ─── OpenAI ──────────────────────────────────────────────── */
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

/* ─── Razorpay ────────────────────────────────────────────── */
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
export const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
export const RAZORPAY_PLAN_CREATOR_ID =
  process.env.RAZORPAY_PLAN_CREATOR_ID ?? "";
export const RAZORPAY_PLAN_SMART_AI_ID =
  process.env.RAZORPAY_PLAN_SMART_AI_ID ?? "";

/* ─── Meta ────────────────────────────────────────────────── */
export const META_APP_SECRET = process.env.META_APP_SECRET ?? "";
export const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "";
export const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN ?? "";

/* ─── App ─────────────────────────────────────────────────── */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://Svation.com";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEV = process.env.NODE_ENV === "development";

/* ─── Plans — for Next.js billing UI only ─────────────────── */
export const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "Free",
    description: "Get started with Instagram automation",
    razorpayPlanId: null,
  },
  creator: {
    id: "creator",
    name: "Creator",
    price: 999,
    priceLabel: "₹999/mo",
    description: "Unlimited automations + WhatsApp + Drip",
    razorpayPlanId: process.env.RAZORPAY_PLAN_CREATOR_ID ?? "",
  },
  smart_ai: {
    id: "smart_ai",
    name: "Smart AI",
    price: 2499,
    priceLabel: "₹2,499/mo",
    description: "Everything + OpenAI in 6 Indian languages",
    razorpayPlanId: process.env.RAZORPAY_PLAN_SMART_AI_ID ?? "",
  },
} as const;
