import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* ─── Tailwind class merge ────────────────────────────────── */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── Date + time ─────────────────────────────────────────── */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)}, ${formatTime(timestamp)}`;
}

/* Is the Meta 24-hour customer service window still open? */
export function isWindowOpen(lastInboundAt: number | undefined): boolean {
  if (!lastInboundAt) return false;
  return Date.now() - lastInboundAt < 24 * 60 * 60 * 1000;
}

/* Days remaining until AI session expires (30d inactivity) */
export function aiSessionDaysRemaining(lastActivityAt: number): number {
  const expiresAt = lastActivityAt + 30 * 24 * 60 * 60 * 1000;
  const remaining = expiresAt - Date.now();
  return Math.max(0, Math.floor(remaining / (24 * 60 * 60 * 1000)));
}

/* ─── Numbers + currency ──────────────────────────────────── */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

/* ─── String helpers ──────────────────────────────────────── */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}…`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/* ─── Keyword matching ────────────────────────────────────── */

/* Levenshtein distance for fuzzy matching */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function matchesKeyword(
  message: string,
  keyword: string,
  matchType: "exact" | "contains" | "fuzzy"
): boolean {
  const msg = message.toLowerCase().trim();
  const kw = keyword.toLowerCase().trim();

  switch (matchType) {
    case "exact":
      return msg === kw;
    case "contains":
      return msg.includes(kw);
    case "fuzzy": {
      /* Check if any word in the message is close to the keyword */
      const words = msg.split(/\s+/);
      const threshold = Math.floor(kw.length * 0.3); /* 30% edit distance */
      return words.some((word) => levenshtein(word, kw) <= threshold);
    }
  }
}

/* ─── Plan helpers ────────────────────────────────────────── */
export type Plan = "starter" | "creator" | "smart_ai";

export const PLAN_LIMITS = {
  starter: {
    automations: 5,
    leadsPerPeriod: 500,
    drip: false,
    smartAi: false,
    whatsapp: false,
    advancedKeywords: false,
    templates: 2,
  },
  creator: {
    automations: Infinity,
    leadsPerPeriod: Infinity,
    drip: true,
    smartAi: false,
    whatsapp: true,
    advancedKeywords: true,
    templates: Infinity,
  },
  smart_ai: {
    automations: Infinity,
    leadsPerPeriod: Infinity,
    drip: true,
    smartAi: true,
    whatsapp: true,
    advancedKeywords: true,
    templates: Infinity,
  },
} as const;

export function canUseFeature(
  plan: Plan,
  feature: keyof (typeof PLAN_LIMITS)["starter"]
): boolean {
  return !!PLAN_LIMITS[plan][feature];
}

export function isAtAutomationLimit(
  plan: Plan,
  currentCount: number
): boolean {
  const limit = PLAN_LIMITS[plan].automations;
  return limit !== Infinity && currentCount >= limit;
}

export function isAtLeadLimit(
  plan: Plan,
  currentPeriodCount: number
): boolean {
  const limit = PLAN_LIMITS[plan].leadsPerPeriod;
  return limit !== Infinity && currentPeriodCount >= limit;
}

/* ─── Referral code generator ─────────────────────────────── */
export function generateReferralCode(name: string): string {
  const prefix = name.split(" ")[0].toUpperCase().slice(0, 6);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

/* ─── Phone number helpers ────────────────────────────────── */
export function formatIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91")) return digits;
  if (digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

/* ─── URL helpers ─────────────────────────────────────────── */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidRazorpayLink(url: string): boolean {
  return isValidUrl(url) && url.includes("razorpay.me");
}

/* ─── Async helpers ───────────────────────────────────────── */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await sleep(delayMs);
    return retry(fn, retries - 1, delayMs * 2);
  }
}