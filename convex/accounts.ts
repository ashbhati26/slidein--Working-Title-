import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { generateReferralCode } from "../lib/utils";
import {
  FREE_AUTOMATION_LIMIT,
  FREE_LEAD_PERIOD_LIMIT,
  LEAD_PERIOD_MS,
} from "../lib/constants";

/* ═══════════════════════════════════════════════════════════
   QUERIES
═══════════════════════════════════════════════════════════ */

export const getMyAccount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
  },
});

export const getAccountByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    return ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
  },
});

export const getAccountById = internalQuery({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, { accountId }) => ctx.db.get(accountId),
});

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

/* ── Fast O(1) index lookup — used in Instagram webhook ──────── */
export const getAccountByIgUserId = internalQuery({
  args: { igUserId: v.string() },
  handler: async (ctx, { igUserId }) => {
    return ctx.db
      .query("accounts")
      .withIndex("by_instagram_user", (q) => q.eq("instagram.igUserId", igUserId))
      .unique();
  },
});

export const getAccountByWhatsAppId = internalQuery({
  args: { phoneNumberId: v.string() },
  handler: async (ctx, { phoneNumberId }) => {
    const all = await ctx.db.query("accounts").collect();
    return all.find((a) => a.whatsapp?.phoneNumberId === phoneNumberId) ?? null;
  },
});

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

    const automations = await ctx.db
      .query("automations")
      .withIndex("by_account", (q) => q.eq("accountId", account._id))
      .collect();

    const activeAutomationCount = automations.filter((a) => a.status !== "draft").length;
    const now = Date.now();
    const periodExpired = now - account.currentPeriodStart > LEAD_PERIOD_MS;
    const currentLeadCount = periodExpired ? 0 : account.currentPeriodLeadCount;

    return {
      plan: account.plan,
      automations: {
        current: activeAutomationCount,
        limit:   account.plan === "starter" ? FREE_AUTOMATION_LIMIT : Infinity,
        atLimit: account.plan === "starter" && activeAutomationCount >= FREE_AUTOMATION_LIMIT,
      },
      leads: {
        current:        currentLeadCount,
        limit:          account.plan === "starter" ? FREE_LEAD_PERIOD_LIMIT : Infinity,
        atLimit:        account.plan === "starter" && currentLeadCount >= FREE_LEAD_PERIOD_LIMIT,
        periodResetsAt: account.currentPeriodStart + LEAD_PERIOD_MS,
      },
      features: {
        whatsapp:         account.plan !== "starter",
        drip:             account.plan !== "starter",
        smartAi:          account.plan === "smart_ai",
        advancedKeywords: account.plan !== "starter",
        allTemplates:     account.plan !== "starter",
      },
    };
  },
});

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
      ctx.db.query("automations").withIndex("by_account", (q) => q.eq("accountId", account._id)).collect(),
      ctx.db.query("leads").withIndex("by_account",       (q) => q.eq("accountId", account._id)).collect(),
    ]);

    const activeAutomations = automations.filter((a) => a.status === "active");
    const convertedLeads    = leads.filter((l) => l.status === "converted");
    const oneDayAgo         = Date.now() - 24 * 60 * 60 * 1000;
    const leadsToday        = leads.filter((l) => l.createdAt > oneDayAgo);
    const totalMessages     = automations.reduce((sum, a) => sum + a.stats.totalRepliesSent, 0);

    return {
      totalAutomations:   automations.length,
      activeAutomations:  activeAutomations.length,
      totalLeads:         leads.length,
      leadsToday:         leadsToday.length,
      totalMessagesSent:  totalMessages,
      conversionRate:     leads.length > 0
        ? Math.round((convertedLeads.length / leads.length) * 100) : 0,
      instagramConnected: !!account.instagram,
      whatsappConnected:  !!account.whatsapp,
    };
  },
});

/* ═══════════════════════════════════════════════════════════
   MUTATIONS
═══════════════════════════════════════════════════════════ */

export const createAccount = internalMutation({
  args: { clerkUserId: v.string(), name: v.string(), email: v.string(), avatarUrl: v.optional(v.string()) },
  handler: async (ctx, { clerkUserId, name, email, avatarUrl }) => {
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (existing) return existing._id;
    const now = Date.now();
    return ctx.db.insert("accounts", {
      clerkUserId, name, email, avatarUrl, plan: "starter",
      planStartDate: now, currentPeriodLeadCount: 0, currentPeriodStart: now,
      referralCode: generateReferralCode(name), referralRewardMonths: 0,
      createdAt: now, updatedAt: now,
    });
  },
});

export const createAccountFromWebhook = mutation({
  args: { clerkUserId: v.string(), name: v.string(), email: v.string(), avatarUrl: v.optional(v.string()) },
  handler: async (ctx, { clerkUserId, name, email, avatarUrl }) => {
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (existing) return existing._id;
    const now = Date.now();
    return ctx.db.insert("accounts", {
      clerkUserId, name, email, avatarUrl, plan: "starter",
      planStartDate: now, currentPeriodLeadCount: 0, currentPeriodStart: now,
      referralCode: generateReferralCode(name), referralRewardMonths: 0,
      createdAt: now, updatedAt: now,
    });
  },
});

export const syncAccountFromClerk = internalMutation({
  args: { clerkUserId: v.string(), name: v.string(), email: v.string(), avatarUrl: v.optional(v.string()) },
  handler: async (ctx, { clerkUserId, name, email, avatarUrl }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!account) return;
    await ctx.db.patch(account._id, { name, email, avatarUrl, updatedAt: Date.now() });
  },
});

export const connectInstagram = mutation({
  args: {
    igUserId:        v.string(),
    igUsername:      v.string(),
    igProfilePicUrl: v.optional(v.string()),
    accessToken:     v.string(),
    tokenExpiresAt:  v.number(),
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
        connectedAt:     Date.now(),
        igUserId:        args.igUserId,
        igUsername:      args.igUsername,
        igProfilePicUrl: args.igProfilePicUrl,
        accessToken:     args.accessToken,
        tokenExpiresAt:  args.tokenExpiresAt,
      },
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const connectInstagramInternal = internalMutation({
  args: {
    accountId:       v.id("accounts"),
    igUserId:        v.string(),
    igUsername:      v.string(),
    igProfilePicUrl: v.optional(v.string()),
    accessToken:     v.string(),
    tokenExpiresAt:  v.number(),
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
      },
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const updateInstagramToken = internalMutation({
  args: { clerkUserId: v.string(), accessToken: v.string(), tokenExpiresAt: v.number() },
  handler: async (ctx, { clerkUserId, accessToken, tokenExpiresAt }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!account?.instagram) return;
    await ctx.db.patch(account._id, {
      instagram: { ...account.instagram, accessToken, tokenExpiresAt },
      updatedAt: Date.now(),
    });
  },
});

export const clearInstagramConnection = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!account) throw new Error("Account not found");

    await ctx.db.patch(account._id, { instagram: undefined, updatedAt: Date.now() });
    return { success: true };
  },
});

export const clearInstagramConnectionInternal = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!account) return;
    await ctx.db.patch(account._id, { instagram: undefined, updatedAt: Date.now() });
  },
});

export const connectWhatsApp = mutation({
  args: {
    phoneNumberId:      v.string(),
    displayPhoneNumber: v.string(),
    wabaId:             v.string(),
    accessToken:        v.string(),
    verifiedName:       v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!account) throw new Error("Account not found");
    if (account.plan === "starter") throw new Error("WhatsApp requires the Creator plan.");

    await ctx.db.patch(account._id, {
      whatsapp: {
        connectedAt:        Date.now(),
        phoneNumberId:      args.phoneNumberId,
        displayPhoneNumber: args.displayPhoneNumber,
        wabaId:             args.wabaId,
        accessToken:        args.accessToken,
        verifiedName:       args.verifiedName,
        messagingLimit:     250,
      },
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const disconnectChannel = mutation({
  args: { channel: v.union(v.literal("instagram"), v.literal("whatsapp")) },
  handler: async (ctx, { channel }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!account) throw new Error("Account not found");
    await ctx.db.patch(account._id, { [channel]: undefined, updatedAt: Date.now() });
  },
});

export const updatePlan = internalMutation({
  args: {
    accountId:                    v.id("accounts"),
    plan:                         v.union(v.literal("starter"), v.literal("creator"), v.literal("smart_ai")),
    razorpayCustomerId:           v.optional(v.string()),
    razorpaySubscriptionId:       v.optional(v.string()),
    subscriptionStatus:           v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled"), v.literal("past_due"))),
    subscriptionCurrentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, { accountId, ...fields }) => {
    await ctx.db.patch(accountId, { ...fields, updatedAt: Date.now() });
  },
});

export const saveSubscriptionId = mutation({
  args: {
    clerkUserId:            v.string(),
    razorpaySubscriptionId: v.string(),
    plan:                   v.union(v.literal("creator"), v.literal("smart_ai")),
  },
  handler: async (ctx, { clerkUserId, razorpaySubscriptionId, plan }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!account) return;
    await ctx.db.patch(account._id, {
      razorpaySubscriptionId,
      plan,
      subscriptionStatus: "active",
      updatedAt: Date.now(),
    });
  },
});

export const getAccountBySubscriptionId = internalQuery({
  args: { razorpaySubscriptionId: v.string() },
  handler: async (ctx, { razorpaySubscriptionId }) => {
    const all = await ctx.db.query("accounts").collect();
    return all.find((a) => a.razorpaySubscriptionId === razorpaySubscriptionId) ?? null;
  },
});

export const markSubscriptionCancelled = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!account) return;
    await ctx.db.patch(account._id, {
      subscriptionStatus: "cancelled",
      updatedAt: Date.now(),
    });
  },
});

export const incrementLeadCount = internalMutation({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, { accountId }) => {
    const account = await ctx.db.get(accountId);
    if (!account) return;
    const now = Date.now();
    const periodExpired = now - account.currentPeriodStart > LEAD_PERIOD_MS;
    await ctx.db.patch(accountId, {
      currentPeriodLeadCount: periodExpired ? 1 : account.currentPeriodLeadCount + 1,
      currentPeriodStart:     periodExpired ? now : account.currentPeriodStart,
      updatedAt:              now,
    });
  },
});

export const addReferralRewardMonths = internalMutation({
  args: { accountId: v.id("accounts"), months: v.number() },
  handler: async (ctx, { accountId, months }) => {
    const account = await ctx.db.get(accountId);
    if (!account) return;
    await ctx.db.patch(accountId, {
      referralRewardMonths: account.referralRewardMonths + months,
      updatedAt: Date.now(),
    });
  },
});

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
    await ctx.db.patch(account._id, { name: name.trim(), updatedAt: Date.now() });
  },
});

export const updateInstagramTokenById = internalMutation({
  args: {
    accountId:      v.id("accounts"),
    accessToken:    v.string(),
    tokenExpiresAt: v.number(),
  },
  handler: async (ctx, { accountId, accessToken, tokenExpiresAt }) => {
    const account = await ctx.db.get(accountId);
    if (!account?.instagram) return;
    await ctx.db.patch(accountId, {
      instagram: { ...account.instagram, accessToken, tokenExpiresAt },
      updatedAt: Date.now(),
    });
  },
});

/* ═══════════════════════════════════════════════════════════
   ANALYTICS QUERY — full data for /analytics page
═══════════════════════════════════════════════════════════ */
export const getAnalytics = query({
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
      ctx.db.query("automations").withIndex("by_account", (q) => q.eq("accountId", account._id)).collect(),
      ctx.db.query("leads").withIndex("by_account",       (q) => q.eq("accountId", account._id)).collect(),
    ]);

    const now      = Date.now();
    const DAY_MS   = 24 * 60 * 60 * 1000;
    const day7ago  = now - 7  * DAY_MS;
    const day30ago = now - 30 * DAY_MS;

    const totalLeads     = leads.length;
    const totalMessages  = automations.reduce((s, a) => s + a.stats.totalRepliesSent, 0);
    const totalTriggers  = automations.reduce((s, a) => s + a.stats.totalTriggers, 0);
    const convertedLeads = leads.filter((l) => l.status === "converted").length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    const leadsLast7Days  = leads.filter((l) => l.createdAt >= day7ago).length;
    const leadsLast30Days = leads.filter((l) => l.createdAt >= day30ago).length;
    const aiLeads        = leads.filter((l) => l.aiSessionActive || l.aiLastActivityAt).length;
    const dripLeads      = leads.filter((l) => l.dripStatus !== "none").length;

    const trend7d = Array.from({ length: 7 }, (_, i) => {
      const dayStart = now - (6 - i) * DAY_MS;
      const dayEnd   = dayStart + DAY_MS;
      const label    = new Date(dayStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const count    = leads.filter((l) => l.createdAt >= dayStart && l.createdAt < dayEnd).length;
      return { label, count };
    });

    const statusCounts = {
      new:             leads.filter((l) => l.status === "new").length,
      in_conversation: leads.filter((l) => l.status === "in_conversation").length,
      qualified:       leads.filter((l) => l.status === "qualified").length,
      converted:       leads.filter((l) => l.status === "converted").length,
      lost:            leads.filter((l) => l.status === "lost").length,
      opted_out:       leads.filter((l) => l.status === "opted_out").length,
    };

    const igLeads = leads.filter((l) => l.channel === "instagram").length;
    const waLeads = leads.filter((l) => l.channel === "whatsapp").length;

    const automationStats = automations
      .map((a) => ({
        id:        a._id,
        name:      a.name,
        channel:   a.channel,
        status:    a.status,
        triggers:  a.stats.totalTriggers,
        leads:     a.stats.totalLeads,
        replies:   a.stats.totalRepliesSent,
        lastFired: a.stats.lastTriggeredAt ?? null,
      }))
      .sort((a, b) => b.triggers - a.triggers)
      .slice(0, 10);

    const keywordMap: Record<string, number> = {};
    for (const lead of leads) {
      const kw = lead.triggerKeyword.toUpperCase();
      keywordMap[kw] = (keywordMap[kw] ?? 0) + 1;
    }
    const topKeywords = Object.entries(keywordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([keyword, count]) => ({ keyword, count }));

    return {
      totalLeads, totalMessages, totalTriggers,
      convertedLeads, conversionRate,
      leadsLast7Days, leadsLast30Days,
      aiLeads, dripLeads,
      trend7d, statusCounts,
      igLeads, waLeads,
      automationStats, topKeywords,
    };
  },
});

/* ═══════════════════════════════════════════════════════════
   REFERRAL STATS — for /referral page
═══════════════════════════════════════════════════════════ */
export const getReferralStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!account) return null;

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerAccountId", account._id))
      .collect();

    const qualified = referrals.filter((r) => r.status === "qualified" || r.status === "rewarded");
    const pending   = referrals.filter((r) => r.status === "pending");

    const qualifiedCount = qualified.length;

    const tiers = [
      { referrals: 1,  freeMonths: 1,  commission: 0    },
      { referrals: 3,  freeMonths: 3,  commission: 0    },
      { referrals: 5,  freeMonths: 6,  commission: 0    },
      { referrals: 10, freeMonths: 0,  commission: 0.30 },
    ];

    const currentTier    = [...tiers].reverse().find((t) => qualifiedCount >= t.referrals) ?? null;
    const nextTier       = tiers.find((t) => qualifiedCount < t.referrals) ?? null;
    const progressToNext = nextTier
      ? Math.round((qualifiedCount / nextTier.referrals) * 100)
      : 100;

    return {
      referralCode:       account.referralCode,
      rewardMonths:       account.referralRewardMonths,
      totalReferrals:     referrals.length,
      qualifiedReferrals: qualifiedCount,
      pendingReferrals:   pending.length,
      currentTier,
      nextTier,
      progressToNext,
      commissionEligible: qualifiedCount >= 10,
      recentReferrals: referrals
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10)
        .map((r) => ({
          id:          r._id,
          status:      r.status,
          createdAt:   r.createdAt,
          qualifiedAt: r.qualifiedAt ?? null,
        })),
    };
  },
});