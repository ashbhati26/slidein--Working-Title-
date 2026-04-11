import { internalAction, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { generateText } from "ai";
import { openai, MODELS, compileSystemPrompt, buildMessageHistory } from "../lib/openAI";
import {
  AI_MAX_TOKENS,
  AI_TEMPERATURE,
  AI_MAX_HISTORY_MESSAGES,
  META_GRAPH_URL,
} from "../lib/constants";

/* ═══════════════════════════════════════════════════════════
   START AI CONVERSATION
   First turn — no history yet. Builds system prompt,
   calls OpenAI, sends reply, caches compiled prompt.
═══════════════════════════════════════════════════════════ */

export const startAiConversation = internalAction({
  args: {
    leadId: v.id("leads"),
    accountId: v.id("accounts"),
    automationId: v.id("automations"),
    channel: v.union(v.literal("instagram"), v.literal("whatsapp")),
    senderId: v.string(),
    messageText: v.string(),
    accessToken: v.string(),
    phoneNumberId: v.optional(v.string()),
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

    const model =
      account?.plan === "smart_ai" ? MODELS.premium : MODELS.default;

    const systemPrompt =
      aiConfig.customSystemPrompt ?? compileSystemPrompt(aiConfig);

    let replyText: string;
    let tokensUsed = 0;

    try {
      const result = await generateText({
        model: openai()(model),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: args.messageText },
        ],
        maxOutputTokens: AI_MAX_TOKENS, /* fixed: maxTokens → maxOutputTokens */
        temperature: AI_TEMPERATURE,
      });

      replyText = result.text.trim();
      tokensUsed = result.usage?.totalTokens ?? 0;
    } catch (err) {
      console.error("[AI] OpenAI startAiConversation failed:", err);
      replyText =
        aiConfig.language === "hinglish"
          ? "Yaar, ek second — main abhi check karta hoon!"
          : "One moment — let me check and get back to you right away!";
    }

    /* Send reply via Meta */
    const metaMessageId = await sendMetaReply({
      channel: args.channel,
      senderId: args.senderId,
      text: replyText,
      accessToken: args.accessToken,
      phoneNumberId: args.phoneNumberId,
    });

    /* Save outbound message */
    await ctx.runMutation(internal.leads.saveOutboundMessage, {
      accountId: args.accountId,
      leadId: args.leadId,
      automationId: args.automationId,
      messageText: replyText,
      source: "ai",
      metaMessageId,
      insideWindow: true,
      aiTokensUsed: tokensUsed,
    });

    /* Cache compiled system prompt so future turns don't recompile */
    if (!aiConfig.customSystemPrompt) {
      await ctx.runMutation(internal.ai.cacheSystemPrompt, {
        automationId: args.automationId,
        systemPrompt,
      });
    }

    await ctx.runMutation(internal.automations.incrementAutomationStats, {
      automationId: args.automationId,
      isNewLead: false,
    });
  },
});

/* ═══════════════════════════════════════════════════════════
   CONTINUE AI CONVERSATION
   All subsequent turns. Loads full history, calls OpenAI.
═══════════════════════════════════════════════════════════ */

export const continueAiConversation = internalAction({
  args: {
    leadId: v.id("leads"),
    accountId: v.id("accounts"),
    automationId: v.id("automations"),
    channel: v.union(v.literal("instagram"), v.literal("whatsapp")),
    senderId: v.string(),
    accessToken: v.optional(v.string()),
    phoneNumberId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const [lead, automation, account] = await Promise.all([
      ctx.runQuery(internal.leads.getLeadById, { leadId: args.leadId }),
      ctx.runQuery(internal.automations.getAutomationInternal, {
        automationId: args.automationId,
      }),
      ctx.runQuery(internal.accounts.getAccountById, {
        accountId: args.accountId,
      }),
    ]);

    if (!lead || !automation || !account) return;
    if (lead.humanTookOver) return;

    const aiConfig = automation.listener.aiConfig;
    if (!aiConfig) return;

    /* Check escalation phrase against last user message */
    if (aiConfig.escalationPhrase) {
      const recentMessages = await ctx.runQuery(internal.ai.getRecentMessages, {
        leadId: args.leadId,
        limit: 3,
      });
      const lastUserMsg = recentMessages.find((m) => m.role === "user");
      if (
        lastUserMsg?.messageText
          .toLowerCase()
          .includes(aiConfig.escalationPhrase.toLowerCase())
      ) {
        /* Mark human takeover directly — no separate mutation needed */
        await ctx.runMutation(internal.ai.markHumanTakeover, {
          leadId: args.leadId,
        });
        return;
      }
    }

    /* Load history */
    const allMessages = await ctx.runQuery(internal.ai.getConversationHistory, {
      leadId: args.leadId,
      limit: AI_MAX_HISTORY_MESSAGES,
    });

    const model =
      account.plan === "smart_ai" ? MODELS.premium : MODELS.default;

    const systemPrompt =
      aiConfig.customSystemPrompt ?? compileSystemPrompt(aiConfig);

    const messageHistory = buildMessageHistory(
      systemPrompt,
      allMessages,
      AI_MAX_HISTORY_MESSAGES
    );

    let replyText: string;
    let tokensUsed = 0;

    try {
      const result = await generateText({
        model: openai()(model),
        messages: messageHistory,
        maxOutputTokens: AI_MAX_TOKENS, /* fixed: maxTokens → maxOutputTokens */
        temperature: AI_TEMPERATURE,
      });

      replyText = result.text.trim();
      tokensUsed = result.usage?.totalTokens ?? 0;
    } catch (err) {
      console.error("[AI] OpenAI continueAiConversation failed:", err);
      replyText =
        aiConfig.language === "hinglish"
          ? "Yaar, thoda technical issue — ek minute mein try karo!"
          : "Sorry, I hit a snag — please try again in a moment!";
    }

    const metaMessageId = await sendMetaReply({
      channel: args.channel,
      senderId: args.senderId,
      text: replyText,
      accessToken: args.accessToken ?? "",
      phoneNumberId: args.phoneNumberId,
    });

    await ctx.runMutation(internal.leads.saveOutboundMessage, {
      accountId: args.accountId,
      leadId: args.leadId,
      automationId: args.automationId,
      messageText: replyText,
      source: "ai",
      metaMessageId,
      insideWindow: lead.windowOpen,
      aiTokensUsed: tokensUsed,
    });

    /* Cancel drip — AI conversation is active */
    if (lead.dripStatus === "running") {
      await ctx.runMutation(internal.drip.cancelDrip, {
        leadId: args.leadId,
        reason: "ai_conversation_active",
      });
    }
  },
});

/* ═══════════════════════════════════════════════════════════
   INTERNAL QUERIES
═══════════════════════════════════════════════════════════ */

export const getConversationHistory = internalQuery({
  args: {
    leadId: v.id("leads"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { leadId, limit }) => {
    const messages = await ctx.db
      .query("conversations")
      .withIndex("by_lead_sent", (q) => q.eq("leadId", leadId))
      .order("asc")
      .collect();

    const filtered = messages.filter(
      (m) => m.role === "user" || m.role === "assistant"
    );

    return limit ? filtered.slice(-limit) : filtered;
  },
});

export const getRecentMessages = internalQuery({
  args: {
    leadId: v.id("leads"),
    limit: v.number(),
  },
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
  args: {
    automationId: v.id("automations"),
    systemPrompt: v.string(),
  },
  handler: async (ctx, { automationId, systemPrompt }) => {
    const automation = await ctx.db.get(automationId);
    if (!automation?.listener.aiConfig) return;

    await ctx.db.patch(automationId, {
      listener: {
        ...automation.listener,
        aiConfig: {
          ...automation.listener.aiConfig,
          customSystemPrompt: systemPrompt,
        },
      },
      updatedAt: Date.now(),
    });
  },
});

/* Fixed: replaces internal.leads.takeOverLead which doesn't exist as internal */
export const markHumanTakeover = internalMutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, { leadId }) => {
    await ctx.db.patch(leadId, {
      humanTookOver: true,
      humanTookOverAt: Date.now(),
      aiSessionActive: false,
      updatedAt: Date.now(),
    });
  },
});

/* ═══════════════════════════════════════════════════════════
   META SEND HELPER
═══════════════════════════════════════════════════════════ */

async function sendMetaReply(args: {
  channel: "instagram" | "whatsapp";
  senderId: string;
  text: string;
  accessToken: string;
  phoneNumberId?: string;
}): Promise<string | undefined> {
  try {
    if (args.channel === "instagram") {
      const res = await fetch(`${META_GRAPH_URL}/me/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${args.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: args.senderId },
          message: { text: args.text },
          messaging_type: "RESPONSE",
        }),
      });
      const data = await res.json();
      return data.message_id;
    }

    if (args.channel === "whatsapp" && args.phoneNumberId) {
      const res = await fetch(
        `${META_GRAPH_URL}/${args.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${args.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: args.senderId,
            type: "text",
            text: { body: args.text, preview_url: false },
          }),
        }
      );
      const data = await res.json();
      return data.messages?.[0]?.id;
    }
  } catch (err) {
    console.error("[AI] Meta send failed:", err);
  }
}