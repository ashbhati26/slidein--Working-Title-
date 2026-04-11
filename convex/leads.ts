import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { DRIP_STOP_KEYWORDS, AI_SESSION_EXPIRY_MS } from "../lib/constants";


/* Leads inbox — paginated list for the leads page */
export const listLeads = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("in_conversation"),
        v.literal("qualified"),
        v.literal("converted"),
        v.literal("opted_out"),
        v.literal("lost")
      )
    ),
    channel: v.optional(
      v.union(v.literal("instagram"), v.literal("whatsapp"))
    ),
    automationId: v.optional(v.id("automations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, channel, automationId, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) return [];

    let leads = await ctx.db
      .query("leads")
      .withIndex("by_account", (q) => q.eq("accountId", account._id))
      .order("desc")
      .collect();

    if (status) leads = leads.filter((l) => l.status === status);
    if (channel) leads = leads.filter((l) => l.channel === channel);
    if (automationId) leads = leads.filter((l) => l.automationId === automationId);

    const sliced = leads.slice(0, limit ?? 50);

    /* Attach last message to each lead */
    const leadsWithMessages = await Promise.all(
      sliced.map(async (lead) => {
        const lastMessage = await ctx.db
          .query("conversations")
          .withIndex("by_lead_sent", (q) => q.eq("leadId", lead._id))
          .order("desc")
          .first();

        return { ...lead, lastMessage: lastMessage ?? null };
      })
    );

    return leadsWithMessages;
  },
});

/* Single lead with full conversation history */
export const getLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, { leadId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const lead = await ctx.db.get(leadId);
    if (!lead) return null;

    /* Ownership check */
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account || lead.accountId !== account._id) return null;

    /* Full conversation history — active messages only */
    const messages = await ctx.db
      .query("conversations")
      .withIndex("by_lead_sent", (q) => q.eq("leadId", leadId))
      .order("asc")
      .collect();

    const automation = await ctx.db.get(lead.automationId);

    return { ...lead, messages, automation };
  },
});

/* Internal — get lead by sender ID for dedup + returning lead check */
export const getLeadBySender = internalQuery({
  args: {
    accountId: v.id("accounts"),
    senderId: v.string(),
  },
  handler: async (ctx, { accountId, senderId }) => {
    return ctx.db
      .query("leads")
      .withIndex("by_account_sender", (q) =>
        q.eq("accountId", accountId).eq("senderId", senderId)
      )
      .first();
  },
});

/* Internal — get lead by ID */
export const getLeadById = internalQuery({
  args: { leadId: v.id("leads") },
  handler: async (ctx, { leadId }) => {
    return ctx.db.get(leadId);
  },
});

/* Unread lead count — for bottom nav badge */
export const getUnreadLeadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) return 0;

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const newLeads = await ctx.db
      .query("leads")
      .withIndex("by_account_status", (q) =>
        q.eq("accountId", account._id).eq("status", "new")
      )
      .filter((q) => q.gt(q.field("createdAt"), oneDayAgo))
      .collect();

    return newLeads.length;
  },
});


/*
  Internal — create or update a lead when a trigger fires.
  Returns: { leadId, isNew }
  Called from convex/http.ts after keyword match confirmed.
*/
export const upsertLead = internalMutation({
  args: {
    accountId: v.id("accounts"),
    automationId: v.id("automations"),
    channel: v.union(v.literal("instagram"), v.literal("whatsapp")),
    senderId: v.string(),
    senderName: v.optional(v.string()),
    senderUsername: v.optional(v.string()),
    senderProfilePicUrl: v.optional(v.string()),
    senderPhone: v.optional(v.string()),
    triggerKeyword: v.string(),
    triggerMessageText: v.string(),
    triggerPostId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    /* Check if lead already exists for this sender on this account */
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_account_sender", (q) =>
        q.eq("accountId", args.accountId).eq("senderId", args.senderId)
      )
      .first();

    if (existing) {
      /* Returning lead — update activity and reopen window */
      await ctx.db.patch(existing._id, {
        lastInboundAt: now,
        windowOpen: true,
        triggerKeyword: args.triggerKeyword,
        triggerMessageText: args.triggerMessageText,
        updatedAt: now,
      });

      return { leadId: existing._id, isNew: false };
    }

    /* New lead */
    const leadId = await ctx.db.insert("leads", {
      accountId: args.accountId,
      automationId: args.automationId,
      channel: args.channel,
      senderId: args.senderId,
      senderName: args.senderName,
      senderUsername: args.senderUsername,
      senderProfilePicUrl: args.senderProfilePicUrl,
      senderPhone: args.senderPhone,
      status: "new",
      aiSessionActive: false,
      humanTookOver: false,
      dripStatus: "none",
      dripCurrentStep: 0,
      lastInboundAt: now,
      windowOpen: true,
      triggerKeyword: args.triggerKeyword,
      triggerMessageText: args.triggerMessageText,
      triggerPostId: args.triggerPostId,
      createdAt: now,
      updatedAt: now,
    });

    return { leadId, isNew: true };
  },
});

/* Internal — save an inbound message to conversation history */
export const saveInboundMessage = internalMutation({
  args: {
    accountId: v.id("accounts"),
    leadId: v.id("leads"),
    automationId: v.id("automations"),
    messageText: v.string(),
    metaMessageId: v.optional(v.string()),
    sentAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    /* Dedup by Meta message ID */
    if (args.metaMessageId) {
      const existing = await ctx.db
        .query("conversations")
        .withIndex("by_meta_message_id", (q) =>
          q.eq("metaMessageId", args.metaMessageId)
        )
        .first();
      if (existing) return existing._id;
    }

    /* Check for opt-out keywords */
    const isOptOut = DRIP_STOP_KEYWORDS.some((kw) =>
      args.messageText.toLowerCase().includes(kw.toLowerCase())
    );

    const messageId = await ctx.db.insert("conversations", {
      accountId: args.accountId,
      leadId: args.leadId,
      automationId: args.automationId,
      role: "user",
      messageText: args.messageText,
      deliveryStatus: "delivered",
      source: "inbound",
      metaMessageId: args.metaMessageId,
      insideWindow: true, /* Inbound always opens/refreshes window */
      archived: false,
      sentAt: args.sentAt,
      createdAt: now,
    });

    /* Update lead — refresh window, handle opt-out */
    const lead = await ctx.db.get(args.leadId);
    if (lead) {
      if (isOptOut) {
        await ctx.db.patch(args.leadId, {
          status: "opted_out",
          optedOutAt: now,
          optOutKeyword: args.messageText,
          windowOpen: false,
          aiSessionActive: false,
          updatedAt: now,
        });
      } else {
        await ctx.db.patch(args.leadId, {
          lastInboundAt: now,
          windowOpen: true,
          aiLastActivityAt: lead.aiSessionActive ? now : lead.aiLastActivityAt,
          updatedAt: now,
        });
      }
    }

    return { messageId, isOptOut };
  },
});

/* Internal — save an outbound message (from SlideIN / AI / drip) */
export const saveOutboundMessage = internalMutation({
  args: {
    accountId: v.id("accounts"),
    leadId: v.id("leads"),
    automationId: v.id("automations"),
    messageText: v.string(),
    source: v.union(
      v.literal("trigger"),
      v.literal("ai"),
      v.literal("drip"),
      v.literal("human")
    ),
    metaMessageId: v.optional(v.string()),
    insideWindow: v.boolean(),
    aiTokensUsed: v.optional(v.number()),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(
      v.union(v.literal("image"), v.literal("pdf"), v.literal("audio"), v.literal("none"))
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const messageId = await ctx.db.insert("conversations", {
      accountId: args.accountId,
      leadId: args.leadId,
      automationId: args.automationId,
      role: "assistant",
      messageText: args.messageText,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      deliveryStatus: "sent",
      source: args.source,
      metaMessageId: args.metaMessageId,
      insideWindow: args.insideWindow,
      aiTokensUsed: args.aiTokensUsed,
      archived: false,
      sentAt: now,
      createdAt: now,
    });

    /* Update lead status based on source */
    const statusUpdate: Record<string, unknown> = { updatedAt: now };

    if (args.source === "ai") {
      statusUpdate.status = "in_conversation";
      statusUpdate.aiSessionActive = true;
      statusUpdate.aiLastActivityAt = now;
      statusUpdate.aiSessionStartedAt = now;
    }

    if (args.source === "human") {
      statusUpdate.humanTookOver = true;
      statusUpdate.humanTookOverAt = now;
      statusUpdate.aiSessionActive = false;
    }

    await ctx.db.patch(args.leadId, statusUpdate);

    return messageId;
  },
});

/* Manual human takeover — owner takes over from AI */
export const takeOverLead = mutation({
  args: {
    leadId: v.id("leads"),
    resumeAi: v.optional(v.boolean()),
  },
  handler: async (ctx, { leadId, resumeAi }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error("Lead not found");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account || lead.accountId !== account._id) {
      throw new Error("Not authorized");
    }

    const now = Date.now();

    await ctx.db.patch(leadId, {
      humanTookOver: resumeAi ? false : true,
      humanTookOverAt: resumeAi ? undefined : now,
      aiSessionActive: resumeAi ? true : false,
      updatedAt: now,
    });
  },
});

/* Update lead status manually */
export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("in_conversation"),
      v.literal("qualified"),
      v.literal("converted"),
      v.literal("opted_out"),
      v.literal("lost")
    ),
    collectedData: v.optional(
      v.object({
        name: v.optional(v.string()),
        city: v.optional(v.string()),
        budget: v.optional(v.string()),
        requirement: v.optional(v.string()),
        timeline: v.optional(v.string()),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { leadId, status, collectedData }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error("Lead not found");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account || lead.accountId !== account._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(leadId, {
      status,
      ...(collectedData ? { collectedData } : {}),
      updatedAt: Date.now(),
    });
  },
});

/* Internal — expire AI sessions older than 30 days */
export const expireAiSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - AI_SESSION_EXPIRY_MS;

    const expiredLeads = await ctx.db
      .query("leads")
      .withIndex("by_ai_activity", (q) =>
        q.eq("aiSessionActive", true)
      )
      .filter((q) => q.lt(q.field("aiLastActivityAt"), cutoff))
      .collect();

    for (const lead of expiredLeads) {
      /* Archive all messages in this session */
      const messages = await ctx.db
        .query("conversations")
        .withIndex("by_lead_active", (q) =>
          q.eq("leadId", lead._id).eq("archived", false)
        )
        .collect();

      for (const msg of messages) {
        await ctx.db.patch(msg._id, { archived: true });
      }

      await ctx.db.patch(lead._id, {
        aiSessionActive: false,
        updatedAt: Date.now(),
      });
    }

    return expiredLeads.length;
  },
});

/* Internal — close 24h window for leads whose window has expired */
export const closeExpiredWindows = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    const openLeads = await ctx.db
      .query("leads")
      .filter((q) =>
        q.and(
          q.eq(q.field("windowOpen"), true),
          q.lt(q.field("lastInboundAt"), cutoff)
        )
      )
      .collect();

    for (const lead of openLeads) {
      await ctx.db.patch(lead._id, {
        windowOpen: false,
        updatedAt: Date.now(),
      });
    }

    return openLeads.length;
  },
});