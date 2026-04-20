import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/* ── Log a raw webhook event ─────────────────────────────────────
   Called fire-and-forget from http.ts webhook handlers.
   Never throws — logging must not break message processing.
─────────────────────────────────────────────────────────────── */
export const logWebhook = internalMutation({
  args: {
    source:     v.union(v.literal("instagram"), v.literal("whatsapp"), v.literal("razorpay"), v.literal("clerk")),
    eventType:  v.string(),
    rawPayload: v.string(),
    accountId:  v.optional(v.id("accounts")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhook_logs", {
      source:     args.source,
      eventType:  args.eventType,
      rawPayload: args.rawPayload,
      accountId:  args.accountId,
      processed:  true,
      receivedAt: Date.now(),
    });
  },
});