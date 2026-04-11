import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  FREE_AUTOMATION_LIMIT,
  IG_DM_RATE_LIMIT_SAFE,
  IG_DEDUP_WINDOW_HOURS,
} from "../lib/constants";
import { matchesKeyword } from "../lib/utils";

/* List all automations for the current user */
export const listMyAutomations = query({
  args: {
    channel: v.optional(
      v.union(v.literal("instagram"), v.literal("whatsapp"))
    ),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("draft"))
    ),
  },
  handler: async (ctx, { channel, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) return [];

    let automationsQuery = ctx.db
      .query("automations")
      .withIndex("by_account", (q) => q.eq("accountId", account._id));

    const automations = await automationsQuery.collect();

    return automations
      .filter((a) => (!channel || a.channel === channel))
      .filter((a) => (!status || a.status === status))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

/* Get a single automation by ID */
export const getAutomation = query({
  args: { automationId: v.id("automations") },
  handler: async (ctx, { automationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const automation = await ctx.db.get(automationId);
    if (!automation) return null;

    /* Verify ownership */
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account || automation.accountId !== account._id) return null;

    return automation;
  },
});

/* Internal — get automation by ID without auth (used in webhook handler) */
export const getAutomationInternal = internalQuery({
  args: { automationId: v.id("automations") },
  handler: async (ctx, { automationId }) => {
    return ctx.db.get(automationId);
  },
});

/* Internal — find matching automation for an inbound message */
export const findMatchingAutomation = internalQuery({
  args: {
    accountId: v.id("accounts"),
    channel: v.union(v.literal("instagram"), v.literal("whatsapp")),
    triggerType: v.union(
      v.literal("ig_comment"),
      v.literal("ig_dm"),
      v.literal("wa_message")
    ),
    messageText: v.string(),
    igPostId: v.optional(v.string()),
  },
  handler: async (ctx, { accountId, channel, triggerType, messageText, igPostId }) => {
    const automations = await ctx.db
      .query("automations")
      .withIndex("by_account_status", (q) =>
        q.eq("accountId", accountId).eq("status", "active")
      )
      .collect();

    /* Filter to matching channel and trigger type */
    const candidates = automations.filter(
      (a) =>
        a.channel === channel && a.trigger.type === triggerType
    );

    for (const automation of candidates) {
      const { trigger } = automation;

      /* Check post attachment for IG comment triggers */
      if (
        triggerType === "ig_comment" &&
        trigger.igPostIds &&
        trigger.igPostIds.length > 0 &&
        igPostId &&
        !trigger.igPostIds.includes(igPostId)
      ) {
        continue;
      }

      /* Check time-of-day restriction (IST = UTC+5:30) */
      if (trigger.activeHoursStart && trigger.activeHoursEnd) {
        const now = new Date();
        const istOffset = 5.5 * 60;
        const istMinutes =
          (now.getUTCHours() * 60 + now.getUTCMinutes() + istOffset) % 1440;

        const [startH, startM] = trigger.activeHoursStart.split(":").map(Number);
        const [endH, endM] = trigger.activeHoursEnd.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if (istMinutes < startMinutes || istMinutes > endMinutes) continue;
      }

      /* Check keywords */
      const keywordMatch = trigger.keywords.some((kw) =>
        matchesKeyword(messageText, kw, trigger.keywordMatchType)
      );

      if (!keywordMatch) continue;

      /* Check exclusion keywords */
      if (trigger.excludeKeywords && trigger.excludeKeywords.length > 0) {
        const excluded = trigger.excludeKeywords.some((kw) =>
          messageText.toLowerCase().includes(kw.toLowerCase())
        );
        if (excluded) continue;
      }

      return automation;
    }

    return null;
  },
});

/* ═══════════════════════════════════════════════════════════
   MUTATIONS
═══════════════════════════════════════════════════════════ */

/* Create a new automation */
export const createAutomation = mutation({
  args: {
    name: v.string(),
    channel: v.union(v.literal("instagram"), v.literal("whatsapp")),
    trigger: v.object({
      type: v.union(
        v.literal("ig_comment"),
        v.literal("ig_dm"),
        v.literal("wa_message")
      ),
      keywords: v.array(v.string()),
      keywordMatchType: v.union(
        v.literal("exact"),
        v.literal("contains"),
        v.literal("fuzzy")
      ),
      excludeKeywords: v.optional(v.array(v.string())),
      igPostIds: v.optional(v.array(v.string())),
      activeHoursStart: v.optional(v.string()),
      activeHoursEnd: v.optional(v.string()),
    }),
    listener: v.object({
      type: v.union(v.literal("fixed_message"), v.literal("smart_ai")),
      message: v.optional(
        v.object({
          text: v.optional(v.string()),
          mediaUrl: v.optional(v.string()),
          mediaType: v.optional(
            v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
          ),
          igPublicReply: v.optional(v.string()),
          buttons: v.optional(
            v.array(v.object({ id: v.string(), title: v.string() }))
          ),
        })
      ),
      aiConfig: v.optional(
        v.object({
          language: v.union(
            v.literal("english"),
            v.literal("hindi"),
            v.literal("hinglish"),
            v.literal("tamil"),
            v.literal("telugu"),
            v.literal("marathi")
          ),
          tone: v.string(),
          businessDescription: v.string(),
          faqs: v.array(
            v.object({ question: v.string(), answer: v.string() })
          ),
          paymentLink: v.optional(v.string()),
          discountInstruction: v.optional(v.string()),
          escalationPhrase: v.optional(v.string()),
          customSystemPrompt: v.optional(v.string()),
        })
      ),
    }),
    drip: v.optional(
      v.object({
        enabled: v.boolean(),
        steps: v.array(
          v.object({
            stepNumber: v.number(),
            delayHours: v.number(),
            message: v.string(),
            mediaUrl: v.optional(v.string()),
            mediaType: v.optional(
              v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
            ),
          })
        ),
        stopOnReply: v.boolean(),
        stopKeywords: v.optional(v.array(v.string())),
      })
    ),
    templateId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account) throw new Error("Account not found");

    /* ── Plan enforcement ─────────────────────────────── */

    /* Free plan: max 5 automations */
    if (account.plan === "starter") {
      const existing = await ctx.db
        .query("automations")
        .withIndex("by_account", (q) => q.eq("accountId", account._id))
        .collect();

      if (existing.filter((a) => a.status !== "draft").length >= FREE_AUTOMATION_LIMIT) {
        throw new Error(
          `Free plan limit reached. Upgrade to Creator for unlimited automations.`
        );
      }
    }

    /* WhatsApp requires Creator+ */
    if (args.channel === "whatsapp" && account.plan === "starter") {
      throw new Error("WhatsApp automation requires the Creator plan.");
    }

    /* Smart AI requires Smart AI plan */
    if (args.listener.type === "smart_ai" && account.plan !== "smart_ai") {
      throw new Error("Smart AI requires the Smart AI plan.");
    }

    /* Advanced keywords require paid plan */
    if (
      args.trigger.keywordMatchType !== "exact" &&
      account.plan === "starter"
    ) {
      throw new Error("Advanced keyword matching requires the Creator plan.");
    }

    /* Drip requires Creator+ */
    if (args.drip?.enabled && account.plan === "starter") {
      throw new Error("Drip sequences require the Creator plan.");
    }

    const now = Date.now();

    const automationId = await ctx.db.insert("automations", {
      accountId: account._id,
      name: args.name,
      status: "active",
      channel: args.channel,
      trigger: args.trigger,
      listener: args.listener,
      drip: args.drip,
      abuseControl: {
        dmRateLimit: IG_DM_RATE_LIMIT_SAFE,
        deduplicateWindow: IG_DEDUP_WINDOW_HOURS,
        spikeDetection: true,
      },
      stats: {
        totalTriggers: 0,
        totalLeads: 0,
        totalRepliesSent: 0,
        lastTriggeredAt: undefined,
      },
      templateId: args.templateId,
      createdAt: now,
      updatedAt: now,
    });

    return automationId;
  },
});

/* Update automation — partial update */
export const updateAutomation = mutation({
  args: {
    automationId: v.id("automations"),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("draft"))
    ),
    trigger: v.optional(
      v.object({
        type: v.union(
          v.literal("ig_comment"),
          v.literal("ig_dm"),
          v.literal("wa_message")
        ),
        keywords: v.array(v.string()),
        keywordMatchType: v.union(
          v.literal("exact"),
          v.literal("contains"),
          v.literal("fuzzy")
        ),
        excludeKeywords: v.optional(v.array(v.string())),
        igPostIds: v.optional(v.array(v.string())),
        activeHoursStart: v.optional(v.string()),
        activeHoursEnd: v.optional(v.string()),
      })
    ),
    listener: v.optional(
      v.object({
        type: v.union(v.literal("fixed_message"), v.literal("smart_ai")),
        message: v.optional(
          v.object({
            text: v.optional(v.string()),
            mediaUrl: v.optional(v.string()),
            mediaType: v.optional(
              v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
            ),
            igPublicReply: v.optional(v.string()),
            buttons: v.optional(
              v.array(v.object({ id: v.string(), title: v.string() }))
            ),
          })
        ),
        aiConfig: v.optional(
          v.object({
            language: v.union(
              v.literal("english"),
              v.literal("hindi"),
              v.literal("hinglish"),
              v.literal("tamil"),
              v.literal("telugu"),
              v.literal("marathi")
            ),
            tone: v.string(),
            businessDescription: v.string(),
            faqs: v.array(
              v.object({ question: v.string(), answer: v.string() })
            ),
            paymentLink: v.optional(v.string()),
            discountInstruction: v.optional(v.string()),
            escalationPhrase: v.optional(v.string()),
            customSystemPrompt: v.optional(v.string()),
          })
        ),
      })
    ),
    drip: v.optional(
      v.object({
        enabled: v.boolean(),
        steps: v.array(
          v.object({
            stepNumber: v.number(),
            delayHours: v.number(),
            message: v.string(),
            mediaUrl: v.optional(v.string()),
            mediaType: v.optional(
              v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
            ),
          })
        ),
        stopOnReply: v.boolean(),
        stopKeywords: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, { automationId, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const automation = await ctx.db.get(automationId);
    if (!automation) throw new Error("Automation not found");

    /* Ownership check */
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account || automation.accountId !== account._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(automationId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return automationId;
  },
});

/* Toggle active/paused */
export const toggleAutomationStatus = mutation({
  args: { automationId: v.id("automations") },
  handler: async (ctx, { automationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const automation = await ctx.db.get(automationId);
    if (!automation) throw new Error("Automation not found");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account || automation.accountId !== account._id) {
      throw new Error("Not authorized");
    }

    const newStatus = automation.status === "active" ? "paused" : "active";

    await ctx.db.patch(automationId, {
      status: newStatus,
      updatedAt: Date.now(),
    });

    return newStatus;
  },
});

/* Delete automation + cascade cancel drip jobs */
export const deleteAutomation = mutation({
  args: { automationId: v.id("automations") },
  handler: async (ctx, { automationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const automation = await ctx.db.get(automationId);
    if (!automation) throw new Error("Automation not found");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!account || automation.accountId !== account._id) {
      throw new Error("Not authorized");
    }

    /* Cancel all pending drip jobs for this automation */
    const pendingDripJobs = await ctx.db
      .query("drip_jobs")
      .withIndex("by_automation", (q) => q.eq("automationId", automationId))
      .collect();

    for (const job of pendingDripJobs) {
      if (job.status === "scheduled" && job.convexJobId) {
        try {
          await ctx.scheduler.cancel(job.convexJobId as Id<"_scheduled_functions">);
        } catch {
          /* Job may have already fired — ignore */
        }
      }
      await ctx.db.patch(job._id, {
        status: "cancelled",
        cancelledAt: Date.now(),
        cancelReason: "automation_deleted",
      });
    }

    await ctx.db.delete(automationId);

    return { success: true };
  },
});

/* Internal — increment automation stats after a trigger fires */
export const incrementAutomationStats = internalMutation({
  args: {
    automationId: v.id("automations"),
    isNewLead: v.boolean(),
  },
  handler: async (ctx, { automationId, isNewLead }) => {
    const automation = await ctx.db.get(automationId);
    if (!automation) return;

    await ctx.db.patch(automationId, {
      stats: {
        totalTriggers: automation.stats.totalTriggers + 1,
        totalLeads: isNewLead
          ? automation.stats.totalLeads + 1
          : automation.stats.totalLeads,
        totalRepliesSent: automation.stats.totalRepliesSent + 1,
        lastTriggeredAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
  },
});

/* Internal — check if sender already triggered this automation recently */
export const checkDuplicate = internalQuery({
  args: {
    accountId: v.id("accounts"),
    automationId: v.id("automations"),
    senderId: v.string(),
    windowHours: v.number(),
  },
  handler: async (ctx, { accountId, automationId, senderId, windowHours }) => {
    const windowMs = windowHours * 60 * 60 * 1000;
    const cutoff = Date.now() - windowMs;

    const existing = await ctx.db
      .query("leads")
      .withIndex("by_account_sender", (q) =>
        q.eq("accountId", accountId).eq("senderId", senderId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("automationId"), automationId),
          q.gt(q.field("createdAt"), cutoff)
        )
      )
      .first();

    return !!existing;
  },
});