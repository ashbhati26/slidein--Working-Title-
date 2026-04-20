import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/*
  SlideIN — Convex Schema v2
  ─────────────────────────────────────────────────────────────
  Instagram connection uses the NEW Instagram Login API (July 2024+)
  No Facebook Page required. No pageId. Just accessToken + igUserId.
  Send DMs via: POST graph.instagram.com/v25.0/{igUserId}/messages
  ─────────────────────────────────────────────────────────────
*/

export default defineSchema({
  accounts: defineTable({
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),

    plan: v.union(
      v.literal("starter"),   /* Free — 5 automations, 500 leads/30d  */
      v.literal("creator"),   /* Rs. 999/mo — unlimited               */
      v.literal("smart_ai"),  /* Rs. 2,499/mo — unlimited + AI        */
    ),

    /* Rolling 30-day window — resets from account creation date */
    planStartDate: v.number(),
    currentPeriodLeadCount: v.number(),
    currentPeriodStart: v.number(),

    /* ── Razorpay billing ────────────────────────────────── */
    razorpayCustomerId: v.optional(v.string()),
    razorpaySubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("paused"),
        v.literal("cancelled"),
        v.literal("past_due"),
      )
    ),
    subscriptionCurrentPeriodEnd: v.optional(v.number()),

    /* ── Instagram connection (Instagram Login API — no FB Page needed) ── */
    instagram: v.optional(v.object({
      connectedAt:     v.number(),
      igUserId:        v.string(),   // IG professional account ID
      igUsername:      v.string(),
      igProfilePicUrl: v.optional(v.string()),
      accessToken:     v.string(),   // Long-lived IG user token (60 days)
      tokenExpiresAt:  v.number(),   // Unix ms — refresh before this
    })),

    /* ── WhatsApp connection ─────────────────────────────── */
    whatsapp: v.optional(v.object({
      connectedAt: v.number(),
      phoneNumberId: v.string(),
      displayPhoneNumber: v.string(),
      wabaId: v.string(),
      accessToken: v.string(),
      verifiedName: v.optional(v.string()),
      qualityRating: v.optional(
        v.union(v.literal("GREEN"), v.literal("YELLOW"), v.literal("RED"))
      ),
      messagingLimit: v.optional(v.number()),
    })),

    /* ── Referral ─────────────────────────────────────────── */
    referralCode: v.string(),
    referredByAccountId: v.optional(v.id("accounts")),
    referralRewardMonths: v.number(),

    /* ── Metadata ─────────────────────────────────────────── */
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_referral_code", ["referralCode"])
    .index("by_razorpay_customer", ["razorpayCustomerId"])
    .index("by_instagram_user", ["instagram.igUserId"]),


  /* ═══════════════════════════════════════════════════════════
     AUTOMATIONS
  ═══════════════════════════════════════════════════════════ */
  automations: defineTable({
    accountId: v.id("accounts"),
    name: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("draft"),
    ),
    channel: v.union(
      v.literal("instagram"),
      v.literal("whatsapp"),
    ),
    trigger: v.object({
      type: v.union(
        v.literal("ig_comment"),
        v.literal("ig_dm"),
        v.literal("wa_message"),
      ),
      keywords: v.array(v.string()),
      keywordMatchType: v.union(
        v.literal("exact"),
        v.literal("contains"),
        v.literal("fuzzy"),
      ),
      excludeKeywords: v.optional(v.array(v.string())),
      igPostIds: v.optional(v.array(v.string())),
      activeHoursStart: v.optional(v.string()),
      activeHoursEnd: v.optional(v.string()),
    }),
    listener: v.object({
      type: v.union(
        v.literal("fixed_message"),
        v.literal("smart_ai"),
      ),
      message: v.optional(v.object({
        text: v.optional(v.string()),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(
          v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
        ),
        igPublicReply: v.optional(v.string()),
        buttons: v.optional(v.array(v.object({
          id: v.string(),
          title: v.string(),
        }))),
      })),
      aiConfig: v.optional(v.object({
        language: v.union(
          v.literal("english"),
          v.literal("hindi"),
          v.literal("hinglish"),
          v.literal("tamil"),
          v.literal("telugu"),
          v.literal("marathi"),
        ),
        tone: v.string(),
        businessDescription: v.string(),
        faqs: v.array(v.object({
          question: v.string(),
          answer: v.string(),
        })),
        paymentLink: v.optional(v.string()),
        discountInstruction: v.optional(v.string()),
        escalationPhrase: v.optional(v.string()),
        customSystemPrompt: v.optional(v.string()),
      })),
    }),
    drip: v.optional(v.object({
      enabled: v.boolean(),
      steps: v.array(v.object({
        stepNumber: v.number(),
        delayHours: v.number(),
        message: v.string(),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(
          v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
        ),
      })),
      stopOnReply: v.boolean(),
      stopKeywords: v.optional(v.array(v.string())),
    })),
    abuseControl: v.object({
      dmRateLimit: v.number(),
      deduplicateWindow: v.number(),
      spikeDetection: v.boolean(),
    }),
    stats: v.object({
      totalTriggers: v.number(),
      totalLeads: v.number(),
      totalRepliesSent: v.number(),
      lastTriggeredAt: v.optional(v.number()),
    }),
    templateId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_account_status", ["accountId", "status"])
    .index("by_account_channel", ["accountId", "channel"]),


  /* ═══════════════════════════════════════════════════════════
     LEADS
  ═══════════════════════════════════════════════════════════ */
  leads: defineTable({
    accountId: v.id("accounts"),
    automationId: v.id("automations"),
    channel: v.union(v.literal("instagram"), v.literal("whatsapp")),
    senderId: v.string(),
    senderName: v.optional(v.string()),
    senderUsername: v.optional(v.string()),
    senderProfilePicUrl: v.optional(v.string()),
    senderPhone: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("in_conversation"),
      v.literal("qualified"),
      v.literal("converted"),
      v.literal("opted_out"),
      v.literal("lost"),
    ),
    aiSessionActive: v.boolean(),
    aiSessionStartedAt: v.optional(v.number()),
    aiLastActivityAt: v.optional(v.number()),
    humanTookOver: v.boolean(),
    humanTookOverAt: v.optional(v.number()),
    dripStatus: v.union(
      v.literal("none"),
      v.literal("running"),
      v.literal("stopped"),
      v.literal("completed"),
    ),
    dripCurrentStep: v.number(),
    collectedData: v.optional(v.object({
      name: v.optional(v.string()),
      city: v.optional(v.string()),
      budget: v.optional(v.string()),
      requirement: v.optional(v.string()),
      timeline: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
    lastInboundAt: v.optional(v.number()),
    windowOpen: v.boolean(),
    triggerKeyword: v.string(),
    triggerMessageText: v.string(),
    triggerPostId: v.optional(v.string()),
    optedOutAt: v.optional(v.number()),
    optOutKeyword: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_account_status", ["accountId", "status"])
    .index("by_account_automation", ["accountId", "automationId"])
    .index("by_account_sender", ["accountId", "senderId"])
    .index("by_automation", ["automationId"])
    .index("by_ai_activity", ["aiSessionActive", "aiLastActivityAt"]),


  /* ═══════════════════════════════════════════════════════════
     CONVERSATIONS
  ═══════════════════════════════════════════════════════════ */
  conversations: defineTable({
    accountId: v.id("accounts"),
    leadId: v.id("leads"),
    automationId: v.id("automations"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    messageText: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(
      v.union(v.literal("image"), v.literal("pdf"), v.literal("audio"), v.literal("none"))
    ),
    deliveryStatus: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read"),
      v.literal("failed"),
    ),
    source: v.union(
      v.literal("trigger"),
      v.literal("ai"),
      v.literal("drip"),
      v.literal("human"),
      v.literal("inbound"),
    ),
    metaMessageId: v.optional(v.string()),
    insideWindow: v.boolean(),
    aiTokensUsed: v.optional(v.number()),
    archived: v.boolean(),
    sentAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_lead", ["leadId"])
    .index("by_lead_active", ["leadId", "archived"])
    .index("by_account", ["accountId"])
    .index("by_lead_sent", ["leadId", "sentAt"])
    .index("by_meta_message_id", ["metaMessageId"]),


  /* ═══════════════════════════════════════════════════════════
     DRIP JOBS
  ═══════════════════════════════════════════════════════════ */
  drip_jobs: defineTable({
    accountId: v.id("accounts"),
    leadId: v.id("leads"),
    automationId: v.id("automations"),
    stepNumber: v.number(),
    scheduledFor: v.number(),
    message: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(
      v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
    ),
    convexJobId: v.optional(v.string()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("sent"),
      v.literal("cancelled"),
      v.literal("failed"),
      v.literal("skipped"),
    ),
    requiresTemplate: v.boolean(),
    templateName: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    cancelReason: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_lead", ["leadId"])
    .index("by_lead_status", ["leadId", "status"])
    .index("by_account", ["accountId"])
    .index("by_scheduled", ["status", "scheduledFor"])
    .index("by_automation", ["automationId"]),


  /* ═══════════════════════════════════════════════════════════
     REFERRALS
  ═══════════════════════════════════════════════════════════ */
  referrals: defineTable({
    referrerAccountId: v.id("accounts"),
    referredAccountId: v.id("accounts"),
    referralCode: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("qualified"),
      v.literal("rewarded"),
      v.literal("invalid"),
    ),
    rewardTier: v.optional(v.number()),
    commissionEligible: v.boolean(),
    commissionRate: v.optional(v.number()),
    qualifiedAt: v.optional(v.number()),
    rewardedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_referrer", ["referrerAccountId"])
    .index("by_referred", ["referredAccountId"])
    .index("by_referrer_status", ["referrerAccountId", "status"])
    .index("by_code", ["referralCode"]),


  /* ═══════════════════════════════════════════════════════════
     WEBHOOK LOGS
  ═══════════════════════════════════════════════════════════ */
  webhook_logs: defineTable({
    accountId: v.optional(v.id("accounts")),
    source: v.union(
      v.literal("instagram"),
      v.literal("whatsapp"),
      v.literal("razorpay"),
      v.literal("clerk"),
    ),
    eventType: v.string(),
    rawPayload: v.string(),
    processed: v.boolean(),
    processingError: v.optional(v.string()),
    metaMessageId: v.optional(v.string()),
    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_source", ["source", "receivedAt"])
    .index("by_account", ["accountId", "receivedAt"])
    .index("by_meta_message_id", ["metaMessageId"])
    .index("by_processed", ["processed", "receivedAt"]),

});