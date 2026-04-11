import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/*
  SlideIN — Convex Schema v1
  ─────────────────────────────────────────────────────────────
  Tables:
    accounts        — one per SlideIN user (Clerk userId as owner)
    automations     — keyword trigger + listener config per account
    leads           — unique contact who triggered an automation
    conversations   — every message exchanged with a lead (AI history)
    drip_jobs       — scheduled follow-up messages per lead
    referrals       — referral tracking between accounts
    webhook_logs    — raw Meta webhook events (debug + audit trail)
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
      v.literal("smart_ai"),  /* Rs. 2,499/mo — unlimited + Gemini    */
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

    /* ── Instagram connection ────────────────────────────── */
    instagram: v.optional(v.object({
      connectedAt: v.number(),
      igUserId: v.string(),
      igUsername: v.string(),
      igProfilePicUrl: v.optional(v.string()),
      accessToken: v.string(),
      tokenExpiresAt: v.number(),
      pageId: v.string(),
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
    .index("by_razorpay_customer", ["razorpayCustomerId"]),


  /* ═══════════════════════════════════════════════════════════
     AUTOMATIONS
     One row per automation rule. An account can have many.
     Each automation = trigger + listener + optional drip config.
  ═══════════════════════════════════════════════════════════ */
  automations: defineTable({
    accountId: v.id("accounts"),

    /* ── Identity ─────────────────────────────────────────── */
    name: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("draft"),
    ),

    /* ── Channel ──────────────────────────────────────────── */
    channel: v.union(
      v.literal("instagram"),
      v.literal("whatsapp"),
    ),

    /* ── Trigger config ───────────────────────────────────── */
    trigger: v.object({
      type: v.union(
        v.literal("ig_comment"),   /* Comment on a post/reel        */
        v.literal("ig_dm"),        /* Direct DM to IG account       */
        v.literal("wa_message"),   /* WhatsApp message              */
      ),

      /* Keywords that activate this automation */
      keywords: v.array(v.string()),

      keywordMatchType: v.union(
        v.literal("exact"),        /* Free plan — full string match  */
        v.literal("contains"),     /* Paid — keyword anywhere in msg */
        v.literal("fuzzy"),        /* Paid — typo-tolerant matching  */
      ),

      /* Keyword exclusions — don't fire if msg also contains these */
      excludeKeywords: v.optional(v.array(v.string())),

      /* IG comment trigger only — restrict to specific posts */
      igPostIds: v.optional(v.array(v.string())),

      /* Time-of-day restriction — IST 24h format e.g. "09:00" */
      activeHoursStart: v.optional(v.string()),
      activeHoursEnd: v.optional(v.string()),
    }),

    /* ── Listener config ──────────────────────────────────── */
    listener: v.object({
      type: v.union(
        v.literal("fixed_message"), /* Send a pre-written reply      */
        v.literal("smart_ai"),      /* Hand off to Gemini            */
      ),

      /* fixed_message — the reply content */
      message: v.optional(v.object({
        text: v.optional(v.string()),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(
          v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
        ),
        /* IG comment trigger — also reply to the comment publicly */
        igPublicReply: v.optional(v.string()),
        /* Quick reply buttons */
        buttons: v.optional(v.array(v.object({
          id: v.string(),
          title: v.string(),
        }))),
      })),

      /* smart_ai — Gemini system prompt compiled from user's form */
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
        escalationPhrase: v.optional(v.string()), /* "talk to owner" → hand off */
        customSystemPrompt: v.optional(v.string()), /* Compiled by SlideIN */
      })),
    }),

    /* ── Drip config ──────────────────────────────────────── */
    drip: v.optional(v.object({
      enabled: v.boolean(),
      steps: v.array(v.object({
        stepNumber: v.number(),        /* 1-indexed                   */
        delayHours: v.number(),        /* Hours after trigger         */
        message: v.string(),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(
          v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
        ),
      })),
      /* Cancel all pending drip steps when lead replies */
      stopOnReply: v.boolean(),
      /* Hard stop keywords — mark lead as opted out */
      stopKeywords: v.optional(v.array(v.string())),
    })),

    /* ── Abuse control ────────────────────────────────────── */
    abuseControl: v.object({
      /* Max DMs per hour — safe ceiling 200, hard limit 750 */
      dmRateLimit: v.number(),
      /* Skip if same user triggered same automation in last 24h */
      deduplicateWindow: v.number(),   /* Hours — default 24          */
      /* Pause + alert if trigger rate spikes 10x in 10 min */
      spikeDetection: v.boolean(),
    }),

    /* ── Stats (denormalised for fast dashboard reads) ────── */
    stats: v.object({
      totalTriggers: v.number(),
      totalLeads: v.number(),
      totalRepliesSent: v.number(),
      lastTriggeredAt: v.optional(v.number()),
    }),

    /* ── Template source ──────────────────────────────────── */
    templateId: v.optional(v.string()), /* Which template it was built from */

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_account_status", ["accountId", "status"])
    .index("by_account_channel", ["accountId", "channel"]),


  /* ═══════════════════════════════════════════════════════════
     LEADS
     One row per unique contact per account.
     A contact who triggers two different automations = one lead.
  ═══════════════════════════════════════════════════════════ */
  leads: defineTable({
    accountId: v.id("accounts"),
    automationId: v.id("automations"),  /* First automation that created them */

    /* ── Contact identity ─────────────────────────────────── */
    channel: v.union(
      v.literal("instagram"),
      v.literal("whatsapp"),
    ),

    /* The platform-specific sender ID */
    senderId: v.string(),              /* IG IGSID or WA phone number  */
    senderName: v.optional(v.string()),
    senderUsername: v.optional(v.string()), /* IG handle              */
    senderProfilePicUrl: v.optional(v.string()),
    senderPhone: v.optional(v.string()),   /* WA phone number          */

    /* ── Lead status ──────────────────────────────────────── */
    status: v.union(
      v.literal("new"),          /* Just triggered, no further action   */
      v.literal("in_conversation"), /* Mid Smart AI conversation        */
      v.literal("qualified"),    /* AI flagged as high intent           */
      v.literal("converted"),    /* Sent payment link / booked          */
      v.literal("opted_out"),    /* Sent STOP — no further messages     */
      v.literal("lost"),         /* Drip exhausted, no response         */
    ),

    /* ── AI session ───────────────────────────────────────── */
    aiSessionActive: v.boolean(),
    aiSessionStartedAt: v.optional(v.number()),
    /* Session expires 30 days after last message */
    aiLastActivityAt: v.optional(v.number()),
    /* Human takeover — owner manually replied */
    humanTookOver: v.boolean(),
    humanTookOverAt: v.optional(v.number()),

    /* ── Drip state ───────────────────────────────────────── */
    dripStatus: v.union(
      v.literal("none"),         /* No drip attached                    */
      v.literal("running"),      /* Drip steps pending                  */
      v.literal("stopped"),      /* Cancelled — lead replied or opted out */
      v.literal("completed"),    /* All steps sent                      */
    ),
    dripCurrentStep: v.number(), /* 0 = not started                     */

    /* ── Collected info (from AI qualification) ───────────── */
    collectedData: v.optional(v.object({
      name: v.optional(v.string()),
      city: v.optional(v.string()),
      budget: v.optional(v.string()),
      requirement: v.optional(v.string()),
      timeline: v.optional(v.string()),
      notes: v.optional(v.string()),    /* Free-form AI observations    */
    })),

    /* ── 24-hour messaging window ─────────────────────────── */
    /* Last time the lead sent a message — window = this + 24h */
    lastInboundAt: v.optional(v.number()),
    /* Is the 24h customer service window currently open? */
    windowOpen: v.boolean(),

    /* ── Trigger context ──────────────────────────────────── */
    triggerKeyword: v.string(),         /* The keyword that fired      */
    triggerMessageText: v.string(),     /* Full original message        */
    triggerPostId: v.optional(v.string()), /* IG post ID if comment    */

    /* ── Opt-out ──────────────────────────────────────────── */
    optedOutAt: v.optional(v.number()),
    optOutKeyword: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_account_status", ["accountId", "status"])
    .index("by_account_automation", ["accountId", "automationId"])
    /* Deduplication — find existing lead for this sender on this account */
    .index("by_account_sender", ["accountId", "senderId"])
    .index("by_automation", ["automationId"])
    /* Expire AI sessions — query leads with old lastActivity */
    .index("by_ai_activity", ["aiSessionActive", "aiLastActivityAt"]),


  /* ═══════════════════════════════════════════════════════════
     CONVERSATIONS
     Every single message in both directions for a lead.
     Fed to Gemini as history on every AI turn.
     Archived after session expires (30d inactivity).
  ═══════════════════════════════════════════════════════════ */
  conversations: defineTable({
    accountId: v.id("accounts"),
    leadId: v.id("leads"),
    automationId: v.id("automations"),

    /* ── Message ──────────────────────────────────────────── */
    role: v.union(
      v.literal("user"),        /* Inbound — from lead              */
      v.literal("assistant"),   /* Outbound — from SlideIN / AI     */
      v.literal("system"),      /* Internal — drip, takeover notes  */
    ),

    messageText: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(
      v.union(v.literal("image"), v.literal("pdf"), v.literal("audio"), v.literal("none"))
    ),

    /* ── Delivery state ───────────────────────────────────── */
    deliveryStatus: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read"),
      v.literal("failed"),
    ),

    /* ── Source tracking ──────────────────────────────────── */
    source: v.union(
      v.literal("trigger"),      /* First auto-reply on keyword      */
      v.literal("ai"),           /* Gemini response                  */
      v.literal("drip"),         /* Drip sequence step               */
      v.literal("human"),        /* Owner manually replied           */
      v.literal("inbound"),      /* Lead's message                   */
    ),

    /* ── Meta IDs for dedup + read receipts ──────────────── */
    metaMessageId: v.optional(v.string()),  /* wamid / IG msg ID     */

    /* Was this message sent inside the 24h customer service window? */
    insideWindow: v.boolean(),

    /* Gemini token usage for this turn (Smart AI plan tracking) */
    aiTokensUsed: v.optional(v.number()),

    /* Is this message part of an archived session? */
    archived: v.boolean(),

    sentAt: v.number(),          /* Unix ms                          */
    createdAt: v.number(),
  })
    .index("by_lead", ["leadId"])
    .index("by_lead_active", ["leadId", "archived"])
    .index("by_account", ["accountId"])
    /* Used to build Gemini history — ordered by sentAt */
    .index("by_lead_sent", ["leadId", "sentAt"])
    .index("by_meta_message_id", ["metaMessageId"]),


  /* ═══════════════════════════════════════════════════════════
     DRIP JOBS
     One row per pending drip step per lead.
     Convex Scheduler fires the job at scheduledFor time.
     Cancelled atomically when lead replies (stopOnReply).
  ═══════════════════════════════════════════════════════════ */
  drip_jobs: defineTable({
    accountId: v.id("accounts"),
    leadId: v.id("leads"),
    automationId: v.id("automations"),

    stepNumber: v.number(),            /* Which drip step (1-indexed)  */
    scheduledFor: v.number(),          /* Unix ms — when to send       */

    /* The message to send */
    message: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(
      v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
    ),

    /* Convex scheduler job ID — needed to cancel */
    convexJobId: v.optional(v.string()),

    status: v.union(
      v.literal("scheduled"),    /* Waiting to fire                  */
      v.literal("sent"),         /* Delivered successfully           */
      v.literal("cancelled"),    /* Lead replied or opted out        */
      v.literal("failed"),       /* Send failed — Meta API error     */
      v.literal("skipped"),      /* Window closed, lead inactive     */
    ),

    /* Will this need a Meta template message? (outside 24h window) */
    requiresTemplate: v.boolean(),
    templateName: v.optional(v.string()), /* Approved Meta template   */

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
     Tracks referral relationships and reward state.
     Reward credited after referred user completes first paid month.
  ═══════════════════════════════════════════════════════════ */
  referrals: defineTable({
    /* The user who shared their referral link */
    referrerAccountId: v.id("accounts"),
    /* The user who signed up through that link */
    referredAccountId: v.id("accounts"),

    referralCode: v.string(),

    status: v.union(
      v.literal("pending"),      /* Referred user signed up, not paid yet  */
      v.literal("qualified"),    /* First paid month completed             */
      v.literal("rewarded"),     /* Referrer's free month(s) credited      */
      v.literal("invalid"),      /* Self-referral or duplicate detected    */
    ),

    /* Which reward tier this referral contributes toward */
    rewardTier: v.optional(v.number()), /* 1, 3, 5, or 10+ referrals */

    /* For 10+ referrals: 30% recurring commission */
    commissionEligible: v.boolean(),
    commissionRate: v.optional(v.number()), /* 0.30 = 30%             */

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
     Raw Meta webhook events stored for debugging and audit.
     Auto-expire after 30 days — not needed long term.
  ═══════════════════════════════════════════════════════════ */
  webhook_logs: defineTable({
    /* Which account this webhook belongs to */
    accountId: v.optional(v.id("accounts")), /* May be null if lookup fails */

    source: v.union(
      v.literal("instagram"),
      v.literal("whatsapp"),
      v.literal("razorpay"),
      v.literal("clerk"),
    ),

    eventType: v.string(),             /* e.g. "messages", "comments"  */
    rawPayload: v.string(),            /* JSON.stringify of full body   */

    /* Processing result */
    processed: v.boolean(),
    processingError: v.optional(v.string()),

    /* Meta message ID if present — for dedup */
    metaMessageId: v.optional(v.string()),

    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_source", ["source", "receivedAt"])
    .index("by_account", ["accountId", "receivedAt"])
    .index("by_meta_message_id", ["metaMessageId"])
    .index("by_processed", ["processed", "receivedAt"]),

});