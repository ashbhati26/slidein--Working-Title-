import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { generateReferralCode } from "../lib/utils";
import {
  FREE_AUTOMATION_LIMIT,
  FREE_LEAD_PERIOD_LIMIT,
  LEAD_PERIOD_MS,
} from "../lib/constants";

/* Get the current user's account — used everywhere in the app */
export const getMyAccount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    return account;
  },
});

/* Internal — get account by Clerk user ID (used in webhooks) */
export const getAccountByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    return ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
  },
});

/* Internal — get account by ID (used across convex functions) */
export const getAccountById = internalQuery({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, { accountId }) => {
    return ctx.db.get(accountId);
  },
});

/* Get account by Razorpay customer ID — used in billing webhook */
export const getAccountByRazorpayCustomer = internalQuery({
  args: { razorpayCustomerId: v.string() },
  handler: async (ctx, { razorpayCustomerId }) => {
    return ctx.db
      .query("accounts")
      .withIndex("by_razorpay_customer", (q) =>
        q.eq("razorpayCustomerId", razorpayCustomerId)
      )
      .unique();
  },
});

/* Check plan limits for the current user */
export const getMyLimits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) return null;

    /* Count active automations */
    const automations = await ctx.db
      .query("automations")
      .withIndex("by_account", (q) => q.eq("accountId", account._id))
      .collect();

    const activeAutomationCount = automations.filter(
      (a) => a.status !== "draft"
    ).length;

    /* Check if lead period has rolled over */
    const now = Date.now();
    const periodExpired = now - account.currentPeriodStart > LEAD_PERIOD_MS;
    const currentLeadCount = periodExpired ? 0 : account.currentPeriodLeadCount;

    return {
      plan: account.plan,
      automations: {
        current: activeAutomationCount,
        limit: account.plan === "starter" ? FREE_AUTOMATION_LIMIT : Infinity,
        atLimit:
          account.plan === "starter" &&
          activeAutomationCount >= FREE_AUTOMATION_LIMIT,
      },
      leads: {
        current: currentLeadCount,
        limit: account.plan === "starter" ? FREE_LEAD_PERIOD_LIMIT : Infinity,
        atLimit:
          account.plan === "starter" &&
          currentLeadCount >= FREE_LEAD_PERIOD_LIMIT,
        periodResetsAt: account.currentPeriodStart + LEAD_PERIOD_MS,
      },
      features: {
        whatsapp: account.plan !== "starter",
        drip: account.plan !== "starter",
        smartAi: account.plan === "smart_ai",
        advancedKeywords: account.plan !== "starter",
        allTemplates: account.plan !== "starter",
      },
    };
  },
});

/* Dashboard stats — denormalized counts for fast reads */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) return null;

    const [automations, leads] = await Promise.all([
      ctx.db
        .query("automations")
        .withIndex("by_account", (q) => q.eq("accountId", account._id))
        .collect(),
      ctx.db
        .query("leads")
        .withIndex("by_account", (q) => q.eq("accountId", account._id))
        .collect(),
    ]);

    const activeAutomations = automations.filter((a) => a.status === "active");
    const convertedLeads = leads.filter((l) => l.status === "converted");

    /* Leads in last 24 hours */
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const leadsToday = leads.filter((l) => l.createdAt > oneDayAgo);

    /* Total messages sent across all automations */
    const totalMessages = automations.reduce(
      (sum, a) => sum + a.stats.totalRepliesSent,
      0
    );

    return {
      totalAutomations: automations.length,
      activeAutomations: activeAutomations.length,
      totalLeads: leads.length,
      leadsToday: leadsToday.length,
      totalMessagesSent: totalMessages,
      conversionRate:
        leads.length > 0
          ? Math.round((convertedLeads.length / leads.length) * 100)
          : 0,
      instagramConnected: !!account.instagram,
      whatsappConnected: !!account.whatsapp,
    };
  },
});

/* ═══════════════════════════════════════════════════════════
   MUTATIONS
═══════════════════════════════════════════════════════════ */

/* Called by Clerk webhook on user.created */
export const createAccount = internalMutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { clerkUserId, name, email, avatarUrl }) => {
    /* Prevent duplicate accounts */
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (existing) return existing._id;

    const now = Date.now();
    const referralCode = generateReferralCode(name);

    const accountId = await ctx.db.insert("accounts", {
      clerkUserId,
      name,
      email,
      avatarUrl,
      plan: "starter",
      planStartDate: now,
      currentPeriodLeadCount: 0,
      currentPeriodStart: now,
      referralCode,
      referralRewardMonths: 0,
      createdAt: now,
      updatedAt: now,
    });

    return accountId;
  },
});

/* Called by Clerk webhook on user.updated */
export const syncAccountFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { clerkUserId, name, email, avatarUrl }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!account) return;

    await ctx.db.patch(account._id, {
      name,
      email,
      avatarUrl,
      updatedAt: Date.now(),
    });
  },
});

/* Save Instagram connection after OAuth */
export const connectInstagram = mutation({
  args: {
    igUserId: v.string(),
    igUsername: v.string(),
    igProfilePicUrl: v.optional(v.string()),
    accessToken: v.string(),
    tokenExpiresAt: v.number(),
    pageId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) throw new Error("Account not found");

    await ctx.db.patch(account._id, {
      instagram: {
        connectedAt: Date.now(),
        igUserId: args.igUserId,
        igUsername: args.igUsername,
        igProfilePicUrl: args.igProfilePicUrl,
        accessToken: args.accessToken,
        tokenExpiresAt: args.tokenExpiresAt,
        pageId: args.pageId,
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/* Save WhatsApp connection */
export const connectWhatsApp = mutation({
  args: {
    phoneNumberId: v.string(),
    displayPhoneNumber: v.string(),
    wabaId: v.string(),
    accessToken: v.string(),
    verifiedName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) throw new Error("Account not found");

    /* Whatsapp requires Creator plan or above */
    if (account.plan === "starter") {
      throw new Error("WhatsApp requires the Creator plan or above.");
    }

    await ctx.db.patch(account._id, {
      whatsapp: {
        connectedAt: Date.now(),
        phoneNumberId: args.phoneNumberId,
        displayPhoneNumber: args.displayPhoneNumber,
        wabaId: args.wabaId,
        accessToken: args.accessToken,
        verifiedName: args.verifiedName,
        messagingLimit: 250, /* New numbers start at 250/day */
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/* Disconnect a channel */
export const disconnectChannel = mutation({
  args: {
    channel: v.union(v.literal("instagram"), v.literal("whatsapp")),
  },
  handler: async (ctx, { channel }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) throw new Error("Account not found");

    await ctx.db.patch(account._id, {
      [channel]: undefined,
      updatedAt: Date.now(),
    });
  },
});

/* Update plan after Razorpay subscription confirmed */
export const updatePlan = internalMutation({
  args: {
    accountId: v.id("accounts"),
    plan: v.union(
      v.literal("starter"),
      v.literal("creator"),
      v.literal("smart_ai")
    ),
    razorpayCustomerId: v.optional(v.string()),
    razorpaySubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("paused"),
        v.literal("cancelled"),
        v.literal("past_due")
      )
    ),
    subscriptionCurrentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { accountId, ...fields } = args;

    await ctx.db.patch(accountId, {
      ...fields,
      updatedAt: Date.now(),
    });
  },
});

/* Increment lead count — called on every new lead creation */
export const incrementLeadCount = internalMutation({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, { accountId }) => {
    const account = await ctx.db.get(accountId);
    if (!account) return;

    const now = Date.now();

    /* Roll over period if expired */
    const periodExpired = now - account.currentPeriodStart > LEAD_PERIOD_MS;

    await ctx.db.patch(accountId, {
      currentPeriodLeadCount: periodExpired
        ? 1
        : account.currentPeriodLeadCount + 1,
      currentPeriodStart: periodExpired ? now : account.currentPeriodStart,
      updatedAt: now,
    });
  },
});

/* Award referral reward months */
export const addReferralRewardMonths = internalMutation({
  args: {
    accountId: v.id("accounts"),
    months: v.number(),
  },
  handler: async (ctx, { accountId, months }) => {
    const account = await ctx.db.get(accountId);
    if (!account) return;

    await ctx.db.patch(accountId, {
      referralRewardMonths: account.referralRewardMonths + months,
      updatedAt: Date.now(),
    });
  },
});

// Public mutation — secret is verified in Next.js route.ts before calling this.
// Convex does NOT check the secret here — it cannot access Next.js env vars.
export const createAccountFromWebhook = mutation({
  args: {
    clerkUserId: v.string(),
    name:        v.string(),
    email:       v.string(),
    avatarUrl:   v.optional(v.string()),
    // NO secret arg — removed entirely
  },
  handler: async (ctx, { clerkUserId, name, email, avatarUrl }) => {
    // Prevent duplicate accounts
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (existing) return existing._id;

    const now          = Date.now();
    const referralCode = generateReferralCode(name);

    return ctx.db.insert("accounts", {
      clerkUserId,
      name,
      email,
      avatarUrl,
      plan:                   "starter",
      planStartDate:          now,
      currentPeriodLeadCount: 0,
      currentPeriodStart:     now,
      referralCode,
      referralRewardMonths:   0,
      createdAt:              now,
      updatedAt:              now,
    });
  },
});

// ═══════════════════════════════════════════════════════════════
// ADD ALL OF THESE to the bottom of convex/accounts.ts
// These use the existing imports already at the top of that file.
// ═══════════════════════════════════════════════════════════════

/* ── Internal: connect Instagram — called from HTTP action ───────
   The regular connectInstagram mutation uses ctx.auth which
   is not available in HTTP actions. This internal version
   takes the accountId directly and skips auth check.
─────────────────────────────────────────────────────────────── */
export const connectInstagramInternal = internalMutation({
  args: {
    accountId:       v.id("accounts"),
    igUserId:        v.string(),
    igUsername:      v.string(),
    igProfilePicUrl: v.optional(v.string()),
    accessToken:     v.string(),
    tokenExpiresAt:  v.number(),
    pageId:          v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, {
      instagram: {
        connectedAt:     Date.now(),
        igUserId:        args.igUserId,
        igUsername:      args.igUsername,
        igProfilePicUrl: args.igProfilePicUrl,
        accessToken:     args.accessToken,
        tokenExpiresAt:  args.tokenExpiresAt,
        pageId:          args.pageId,
      },
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

/* ── Update profile name ─────────────────────────────────────── */
export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) throw new Error("Account not found");

    await ctx.db.patch(account._id, {
      name: name.trim(),
      updatedAt: Date.now(),
    });
  },
});

/* ── Internal: get account by WhatsApp phoneNumberId ────────────
   Used in the WhatsApp webhook to route inbound messages.
─────────────────────────────────────────────────────────────── */
export const getAccountByWhatsAppId = internalQuery({
  args: { phoneNumberId: v.string() },
  handler: async (ctx, { phoneNumberId }) => {
    const all = await ctx.db.query("accounts").collect();
    return all.find((a) => a.whatsapp?.phoneNumberId === phoneNumberId) ?? null;
  },
});

/* ── Internal: get account by Instagram user ID ─────────────────
   Used in the Instagram webhook to route inbound events.
─────────────────────────────────────────────────────────────── */
export const getAccountByIgUserId = internalQuery({
  args: { igUserId: v.string() },
  handler: async (ctx, { igUserId }) => {
    const all = await ctx.db.query("accounts").collect();
    return all.find((a) => a.instagram?.igUserId === igUserId) ?? null;
  },
});

/* ── Internal: update Instagram token after refresh ─────────────
   Called by instagram.refreshInstagramToken action.
─────────────────────────────────────────────────────────────── */
export const updateInstagramToken = internalMutation({
  args: {
    clerkUserId:    v.string(),
    accessToken:    v.string(),
    tokenExpiresAt: v.number(),
  },
  handler: async (ctx, { clerkUserId, accessToken, tokenExpiresAt }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!account?.instagram) return;

    await ctx.db.patch(account._id, {
      instagram: {
        ...account.instagram,
        accessToken,
        tokenExpiresAt,
      },
      updatedAt: Date.now(),
    });
  },
});

export const clearInstagramConnection = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
 
    if (!account) return;
 
    // Use undefined to remove the field entirely from the document
    await ctx.db.patch(account._id, {
      instagram: undefined,
      updatedAt: Date.now(),
    });
  },
});