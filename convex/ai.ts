import { internalAction, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { generateText } from "ai";
import { gemini, MODELS, compileSystemPrompt, buildMessageHistory, type ChatMessage } from "../lib/gemini";
import {
  AI_MAX_TOKENS,
  AI_TEMPERATURE,
  AI_MAX_HISTORY_MESSAGES,
} from "../lib/constants";

/* ═══════════════════════════════════════════════════════════
   START AI CONVERSATION — first turn
═══════════════════════════════════════════════════════════ */
export const startAiConversation = internalAction({
  args: {
    leadId:        v.id("leads"),
    accountId:     v.id("accounts"),
    automationId:  v.id("automations"),
    channel:       v.union(v.literal("instagram"), v.literal("whatsapp")),
    senderId:      v.string(),
    messageText:   v.string(),
    accessToken:   v.string(),
    phoneNumberId: v.optional(v.string()),
    igUserId:      v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const automation = await ctx.runQuery(
      internal.automations.getAutomationInternal,
      { automationId: args.automationId }
    );
    if (!automation || automation.listener.type !== "smart_ai") return;

    const aiConfig = automation.listener.aiConfig;
    if (!aiConfig) return;

    const account = await ctx.runQuery(internal.accounts.getAccountById, {
      accountId: args.accountId,
    });

    const igUserId     = args.igUserId ?? account?.instagram?.igUserId;
    const model        = account?.plan === "smart_ai" ? MODELS.premium : MODELS.default;
    const systemPrompt = aiConfig.customSystemPrompt ?? compileSystemPrompt(aiConfig);

    let replyText: string;
    let tokensUsed = 0;

    try {
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user",   content: args.messageText },
      ];

      const result = await generateText({
        model:              gemini()(model),
        messages,
        maxOutputTokens:    AI_MAX_TOKENS,
        temperature:        AI_TEMPERATURE,
      });
      replyText  = result.text.trim();
      tokensUsed = result.usage?.totalTokens ?? 0;
    } catch (err) {
      console.error("[AI] Gemini startAiConversation failed:", err);
      replyText = aiConfig.language === "hinglish"
        ? "Yaar, ek second — main abhi check karta hoon!"
        : "One moment — let me check and get back to you right away!";
    }

    const metaMessageId = await sendMetaReply({
      channel:       args.channel,
      senderId:      args.senderId,
      text:          replyText,
      accessToken:   args.accessToken,
      phoneNumberId: args.phoneNumberId,
      igUserId,
    });

    await ctx.runMutation(internal.leads.saveOutboundMessage, {
      accountId:    args.accountId,
      leadId:       args.leadId,
      automationId: args.automationId,
      messageText:  replyText,
      source:       "ai",
      metaMessageId,
      insideWindow: true,
      aiTokensUsed: tokensUsed,
    });

    if (!aiConfig.customSystemPrompt) {
      await ctx.runMutation(internal.ai.cacheSystemPrompt, {
        automationId: args.automationId,
        systemPrompt,
      });
    }

    await ctx.runMutation(internal.automations.incrementAutomationStats, {
      automationId: args.automationId,
      isNewLead:    false,
    });

    await ctx.runMutation(internal.ai.markAiSessionActive, {
      leadId: args.leadId,
    });
  },
});

/* ═══════════════════════════════════════════════════════════
   CONTINUE AI CONVERSATION — subsequent turns
═══════════════════════════════════════════════════════════ */
export const continueAiConversation = internalAction({
  args: {
    leadId:        v.id("leads"),
    accountId:     v.id("accounts"),
    automationId:  v.id("automations"),
    channel:       v.union(v.literal("instagram"), v.literal("whatsapp")),
    senderId:      v.string(),
    messageText:   v.string(),
    accessToken:   v.optional(v.string()),
    phoneNumberId: v.optional(v.string()),
    igUserId:      v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const [lead, automation, account] = await Promise.all([
      ctx.runQuery(internal.leads.getLeadById,                 { leadId:        args.leadId       }),
      ctx.runQuery(internal.automations.getAutomationInternal, { automationId:  args.automationId }),
      ctx.runQuery(internal.accounts.getAccountById,           { accountId:     args.accountId    }),
    ]);

    if (!lead || !automation || !account) return;

    /* Human took over — AI is paused */
    if (lead.humanTookOver) {
      console.log(`[AI] Lead ${args.leadId} — human took over, skipping AI`);
      return;
    }

    const aiConfig = automation.listener.aiConfig;
    if (!aiConfig) return;

    const igUserId = args.igUserId ?? account.instagram?.igUserId;

    /* Escalation check */
    if (aiConfig.escalationPhrase) {
      const recentMessages = await ctx.runQuery(internal.ai.getRecentMessages, {
        leadId: args.leadId, limit: 3,
      });
      const lastUserMsg = recentMessages.find((m) => m.role === "user");
      if (lastUserMsg?.messageText.toLowerCase().includes(aiConfig.escalationPhrase.toLowerCase())) {
        await ctx.runMutation(internal.ai.markHumanTakeover, { leadId: args.leadId });
        console.log(`[AI] Escalation phrase detected — handing over to human`);
        return;
      }
    }

    const allMessages = await ctx.runQuery(internal.ai.getConversationHistory, {
      leadId: args.leadId, limit: AI_MAX_HISTORY_MESSAGES,
    });

    const model          = account.plan === "smart_ai" ? MODELS.premium : MODELS.default;
    const systemPrompt   = aiConfig.customSystemPrompt ?? compileSystemPrompt(aiConfig);
    const messageHistory = buildMessageHistory(systemPrompt, allMessages, AI_MAX_HISTORY_MESSAGES);

    let replyText: string;
    let tokensUsed = 0;

    try {
      const result = await generateText({
        model:           gemini()(model),
        messages:        messageHistory,
        maxOutputTokens: AI_MAX_TOKENS,
        temperature:     AI_TEMPERATURE,
      });
      replyText  = result.text.trim();
      tokensUsed = result.usage?.totalTokens ?? 0;
    } catch (err) {
      console.error("[AI] Gemini continueAiConversation failed:", err);
      replyText = aiConfig.language === "hinglish"
        ? "Yaar, thoda technical issue — ek minute mein try karo!"
        : "Sorry, I hit a snag — please try again in a moment!";
    }

    const metaMessageId = await sendMetaReply({
      channel:       args.channel,
      senderId:      args.senderId,
      text:          replyText,
      accessToken:   args.accessToken ?? "",
      phoneNumberId: args.phoneNumberId,
      igUserId,
    });

    await ctx.runMutation(internal.leads.saveOutboundMessage, {
      accountId:    args.accountId,
      leadId:       args.leadId,
      automationId: args.automationId,
      messageText:  replyText,
      source:       "ai",
      metaMessageId,
      insideWindow: lead.windowOpen,
      aiTokensUsed: tokensUsed,
    });

    /* Cancel drip since lead is actively replying */
    if (lead.dripStatus === "running") {
      await ctx.runMutation(internal.drip.cancelDrip, {
        leadId: args.leadId, reason: "ai_conversation_active",
      });
    }
  },
});

/* ═══════════════════════════════════════════════════════════
   INTERNAL QUERIES
═══════════════════════════════════════════════════════════ */

export const getConversationHistory = internalQuery({
  args: { leadId: v.id("leads"), limit: v.optional(v.number()) },
  handler: async (ctx, { leadId, limit }) => {
    const messages = await ctx.db
      .query("conversations")
      .withIndex("by_lead_sent", (q) => q.eq("leadId", leadId))
      .order("asc")
      .collect();
    const filtered = messages.filter((m) => m.role === "user" || m.role === "assistant");
    return limit ? filtered.slice(-limit) : filtered;
  },
});

export const getRecentMessages = internalQuery({
  args: { leadId: v.id("leads"), limit: v.number() },
  handler: async (ctx, { leadId, limit }) => {
    return ctx.db
      .query("conversations")
      .withIndex("by_lead_sent", (q) => q.eq("leadId", leadId))
      .order("desc")
      .take(limit);
  },
});

/* ═══════════════════════════════════════════════════════════
   INTERNAL MUTATIONS
═══════════════════════════════════════════════════════════ */

export const cacheSystemPrompt = internalMutation({
  args: { automationId: v.id("automations"), systemPrompt: v.string() },
  handler: async (ctx, { automationId, systemPrompt }) => {
    const automation = await ctx.db.get(automationId);
    if (!automation?.listener.aiConfig) return;
    await ctx.db.patch(automationId, {
      listener: {
        ...automation.listener,
        aiConfig: { ...automation.listener.aiConfig, customSystemPrompt: systemPrompt },
      },
      updatedAt: Date.now(),
    });
  },
});

export const markHumanTakeover = internalMutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, { leadId }) => {
    await ctx.db.patch(leadId, {
      humanTookOver:   true,
      humanTookOverAt: Date.now(),
      aiSessionActive: false,
      updatedAt:       Date.now(),
    });
  },
});

export const markAiSessionActive = internalMutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, { leadId }) => {
    await ctx.db.patch(leadId, {
      aiSessionActive:    true,
      aiSessionStartedAt: Date.now(),
      aiLastActivityAt:   Date.now(),
      updatedAt:          Date.now(),
    });
  },
});

/* ═══════════════════════════════════════════════════════════
   META SEND HELPER
═══════════════════════════════════════════════════════════ */
async function sendMetaReply(args: {
  channel:        "instagram" | "whatsapp";
  senderId:       string;
  text:           string;
  accessToken:    string;
  phoneNumberId?: string;
  igUserId?:      string;
}): Promise<string | undefined> {
  try {
    if (args.channel === "instagram") {
      if (!args.igUserId) {
        console.error("[AI] Cannot send IG DM — igUserId missing");
        return undefined;
      }
      const res = await fetch(
        `https://graph.instagram.com/v25.0/${args.igUserId}/messages`,
        {
          method:  "POST",
          headers: {
            Authorization:  `Bearer ${args.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: { id: args.senderId },
            message:   { text: args.text },
          }),
        },
      );
      const data = await res.json() as { message_id?: string; error?: { message: string } };
      if (!res.ok) console.error("[AI] IG DM failed:", data.error?.message);
      return data.message_id;
    }

    if (args.channel === "whatsapp" && args.phoneNumberId) {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${args.phoneNumberId}/messages`,
        {
          method:  "POST",
          headers: {
            Authorization:  `Bearer ${args.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to:   args.senderId,
            type: "text",
            text: { body: args.text, preview_url: false },
          }),
        },
      );
      const data = await res.json() as { messages?: Array<{ id: string }> };
      return data.messages?.[0]?.id;
    }
  } catch (err) {
    console.error("[AI] Meta send failed:", err);
  }
}