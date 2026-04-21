import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

/* ═══════════════════════════════════════════════════════════
   CLERK WEBHOOK
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) return new Response("Missing secret", { status: 500 });

    const svixId        = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature)
      return new Response("Missing svix headers", { status: 400 });

    const payload = await req.text();
    let evt: {
      type: string;
      data: {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
        image_url?: string;
      };
    };

    try {
      const wh = new Webhook(secret);
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof evt;
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      await ctx.runMutation(api.accounts.createAccountFromWebhook, {
        clerkUserId: id,
        name: [first_name, last_name].filter(Boolean).join(" ") || "User",
        email: email_addresses?.[0]?.email_address ?? "",
        avatarUrl: image_url ?? undefined,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

/* ═══════════════════════════════════════════════════════════
   INSTAGRAM OAUTH CALLBACK
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/instagram-oauth-callback",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url   = new URL(req.url);
    const code  = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const appUrl      = process.env.NEXT_PUBLIC_APP_URL!;
    const siteUrl     = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!;
    const appId       = process.env.INSTAGRAM_APP_ID!;
    const appSecret   = process.env.INSTAGRAM_APP_SECRET!;
    const redirectUri = `${siteUrl}/instagram-oauth-callback`;

    if (error || !code || !state) {
      console.error("[IG OAuth] Missing params:", { error, hasCode: !!code, hasState: !!state });
      return Response.redirect(`${appUrl}/settings?ig_error=access_denied`);
    }

    try {
      const shortTokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: appId, client_secret: appSecret,
          grant_type: "authorization_code", redirect_uri: redirectUri, code,
        }).toString(),
      });

      const shortToken = await shortTokenRes.json() as {
        access_token?: string; user_id?: string;
        error_type?: string; error_message?: string;
      };

      if (!shortToken.access_token) {
        console.error("[IG OAuth] Short token failed:", shortToken.error_message);
        return Response.redirect(`${appUrl}/settings?ig_error=token_exchange_failed`);
      }

      const longTokenRes = await fetch(
        `https://graph.instagram.com/access_token?` +
        new URLSearchParams({
          grant_type: "ig_exchange_token",
          client_secret: appSecret,
          access_token: shortToken.access_token,
        }),
      );

      const longToken = await longTokenRes.json() as {
        access_token?: string; expires_in?: number; error?: { message: string };
      };

      if (!longToken.access_token) {
        console.error("[IG OAuth] Long token failed:", longToken.error?.message);
        return Response.redirect(`${appUrl}/settings?ig_error=token_exchange_failed`);
      }

      const accessToken    = longToken.access_token;
      const tokenExpiresAt = Date.now() + (longToken.expires_in ?? 5184000) * 1000;

      const profileRes = await fetch(
        `https://graph.instagram.com/v25.0/me?` +
        new URLSearchParams({
          fields: "id,username,profile_picture_url,user_id",
          access_token: accessToken,
        }),
      );

      const profile = await profileRes.json() as {
        id?: string; user_id?: string; username?: string;
        profile_picture_url?: string; error?: { message: string };
      };

      if (!profile.id) {
        console.error("[IG OAuth] Profile failed:", profile.error?.message);
        return Response.redirect(`${appUrl}/settings?ig_error=profile_fetch_failed`);
      }

      const account = await ctx.runQuery(internal.accounts.getAccountByClerkId, {
        clerkUserId: state,
      }) as { _id: string } | null;

      if (!account) {
        console.error("[IG OAuth] No Convex account for clerkUserId:", state);
        return Response.redirect(`${appUrl}/settings?ig_error=account_not_found`);
      }

      await ctx.runMutation(internal.accounts.connectInstagramInternal, {
        accountId:       account._id as any,
        igUserId:        profile.user_id ?? profile.id,
        igUsername:      profile.username ?? "unknown",
        igProfilePicUrl: profile.profile_picture_url,
        accessToken,
        tokenExpiresAt,
      });

      console.log(`[IG OAuth] ✅ Connected @${profile.username} igUserId=${profile.user_id ?? profile.id}`);
      return Response.redirect(`${appUrl}/settings?ig_connected=1`);

    } catch (err) {
      console.error("[IG OAuth] Unexpected error:", err);
      return Response.redirect(`${appUrl}/settings?ig_error=unknown`);
    }
  }),
});

/* ═══════════════════════════════════════════════════════════
   INSTAGRAM WEBHOOK VERIFICATION
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/instagram",
  method: "GET",
  handler: httpAction(async (_ctx, req) => {
    const url       = new URL(req.url);
    const mode      = url.searchParams.get("hub.mode");
    const token     = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN)
      return new Response(challenge ?? "", { status: 200 });

    return new Response("Forbidden", { status: 403 });
  }),
});

/* ═══════════════════════════════════════════════════════════
   INSTAGRAM WEBHOOK — POST /instagram
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/instagram",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json() as {
      object?: string;
      entry?: Array<{
        id?: string;
        messaging?: Array<{
          sender?:    { id: string };
          recipient?: { id: string };
          message?:   { text?: string; mid?: string; is_echo?: boolean };
        }>;
        changes?: Array<{
          field?: string;
          value?: {
            id?: string; text?: string;
            from?: { id: string }; media?: { id: string }; comment_id?: string;
          };
        }>;
      }>;
    };

    if (body.object !== "instagram") return new Response("OK", { status: 200 });

    await ctx.runMutation(internal.webhooks.logWebhook, {
      source: "instagram", eventType: detectEventType(body), rawPayload: JSON.stringify(body),
    });

    try {
      for (const entry of body.entry ?? []) {
        const igUserId = entry.id;
        if (!igUserId) continue;

        const account = await ctx.runQuery(internal.accounts.getAccountByIgUserId, { igUserId }) as {
          _id: string;
          instagram?: { accessToken: string; igUserId: string; tokenExpiresAt: number } | null;
        } | null;

        if (!account?.instagram?.accessToken) {
          console.warn("[IG webhook] No account for igUserId:", igUserId);
          continue;
        }

        let { accessToken } = account.instagram;
        const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

        if (Date.now() > account.instagram.tokenExpiresAt - twoDaysMs) {
          const refreshed = await refreshIgToken(accessToken);
          if (refreshed) {
            await ctx.runMutation(internal.accounts.updateInstagramTokenById, {
              accountId: account._id as any,
              accessToken: refreshed.accessToken,
              tokenExpiresAt: refreshed.tokenExpiresAt,
            });
            accessToken = refreshed.accessToken;
          }
        }

        const accountId = account._id as any;

        async function sendDM(recipientId: string, text: string): Promise<string | undefined> {
          const delays = [0, 500, 1500];
          for (let i = 0; i < delays.length; i++) {
            if (delays[i] > 0) await sleep(delays[i]);
            try {
              const res = await fetch(
                `https://graph.instagram.com/v25.0/${igUserId}/messages`,
                {
                  method: "POST",
                  headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                  body: JSON.stringify({ recipient: { id: recipientId }, message: { text } }),
                },
              );
              const data = await res.json() as { message_id?: string; error?: { message: string; code?: number } };
              if (res.ok) { console.log(`✅ DM sent (attempt ${i + 1}) id=${data.message_id}`); return data.message_id; }
              if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                console.error(`[sendDM] 4xx error, not retrying. ${res.status}:`, data.error?.message);
                return undefined;
              }
            } catch (err) { console.warn(`[sendDM] Attempt ${i + 1} threw:`, err); }
          }
          console.error("[sendDM] ❌ All 3 attempts failed");
          return undefined;
        }

        /* Public comment replies use graph.instagram.com/v25.0/{commentId}/replies
           with the Instagram user token — no Facebook Page token needed.
           Private DMs use graph.instagram.com/v25.0/{igUserId}/messages. */

        /* ── DM events ── */
        for (const messaging of entry.messaging ?? []) {
          if (messaging.message?.is_echo) continue;
          if (messaging.sender?.id === igUserId) continue;

          const senderId    = messaging.sender?.id ?? "";
          const messageText = messaging.message?.text ?? "";
          const metaMsgId   = messaging.message?.mid;
          if (!senderId || !messageText) continue;

          console.log(`📩 DM from ${senderId}: "${messageText}"`);

          /* ── Step 1: Check if sender has an active AI session ──
             If yes, this is a conversation continuation — route to
             continueAiConversation instead of keyword matching.     */
          const existingLead = await ctx.runQuery(internal.leads.getLeadBySender, {
            accountId, senderId,
          });

          if (existingLead?.aiSessionActive && !existingLead.humanTookOver) {
            console.log(`🔄 Continuing AI conversation for lead ${existingLead._id}`);

            /* Save inbound message */
            await ctx.runMutation(internal.leads.saveInboundMessage, {
              accountId,
              leadId:       existingLead._id,
              automationId: existingLead.automationId,
              messageText,
              metaMessageId: metaMsgId,
              sentAt: Date.now(),
            });

            /* Continue AI conversation */
            await ctx.runAction(internal.ai.continueAiConversation, {
              leadId:       existingLead._id,
              accountId:    account._id as any,
              automationId: existingLead.automationId,
              channel:      "instagram",
              senderId,
              messageText,
              accessToken,
              igUserId,
            });

            /* Cancel drip since lead is actively replying */
            if (existingLead.dripStatus === "running") {
              await ctx.runMutation(internal.drip.cancelDrip, {
                leadId: existingLead._id, reason: "lead_replied",
              });
            }

            continue; // skip keyword matching for this message
          }

          /* ── Step 2: No active AI session — try keyword matching ── */
          const automation = await ctx.runQuery(internal.automations.findMatchingAutomation, {
            accountId, channel: "instagram", triggerType: "ig_dm", messageText,
          });
          if (!automation) continue;

          const { leadId, isNew } = await ctx.runMutation(internal.leads.upsertLead, {
            accountId, automationId: automation._id, channel: "instagram",
            senderId, triggerKeyword: automation.trigger.keywords[0], triggerMessageText: messageText,
          });

          await ctx.runMutation(internal.leads.saveInboundMessage, {
            accountId, leadId, automationId: automation._id,
            messageText, metaMessageId: metaMsgId, sentAt: Date.now(),
          });

          if (automation.listener.type === "fixed_message") {
            const text = automation.listener.message?.text ?? "";
            if (text) {
              const metaId = await sendDM(senderId, text);
              await ctx.runMutation(internal.leads.saveOutboundMessage, {
                accountId, leadId, automationId: automation._id,
                messageText: text, source: "trigger", metaMessageId: metaId, insideWindow: true,
              });
              await ctx.runMutation(internal.automations.incrementAutomationStats, {
                automationId: automation._id, isNewLead: isNew,
              });
            }
          } else if (automation.listener.type === "smart_ai") {
            await ctx.runAction(internal.ai.startAiConversation, {
              leadId, accountId: account._id as any, automationId: automation._id,
              channel: "instagram", senderId, messageText, accessToken, igUserId,
            });
          }

          if (automation.drip?.enabled && isNew && (automation.drip.steps?.length ?? 0) > 0) {
            await ctx.runMutation(internal.drip.scheduleDrip, {
              accountId: account._id as any, leadId, automationId: automation._id,
              steps: automation.drip.steps, stopOnReply: automation.drip.stopOnReply,
            });
          }
        }

        /* ── Comment events ── */
        for (const change of entry.changes ?? []) {
          if (change.field !== "comments" && change.field !== "mention") continue;

          const comment     = change.value;
          const senderId    = comment?.from?.id ?? "";
          const messageText = comment?.text ?? "";
          const postId      = comment?.media?.id;
          const commentId   = comment?.comment_id ?? comment?.id;
          if (!senderId || !messageText) continue;

          console.log(`💬 COMMENT from ${senderId}: "${messageText}"`);

          const automation = await ctx.runQuery(internal.automations.findMatchingAutomation, {
            accountId, channel: "instagram", triggerType: "ig_comment", messageText, igPostId: postId,
          });
          if (!automation) continue;

          const { leadId, isNew } = await ctx.runMutation(internal.leads.upsertLead, {
            accountId, automationId: automation._id, channel: "instagram",
            senderId, triggerKeyword: automation.trigger.keywords[0],
            triggerMessageText: messageText, triggerPostId: postId,
          });

          await ctx.runMutation(internal.leads.saveInboundMessage, {
            accountId, leadId, automationId: automation._id, messageText, sentAt: Date.now(),
          });

          if (automation.listener.type === "fixed_message") {
            const replyText   = automation.listener.message?.text ?? "";
            const publicReply = automation.listener.message?.igPublicReply;

            /* 1. Public comment reply — uses graph.instagram.com with IG user token */
            if (publicReply && commentId) {
              try {
                const pubRes = await fetch(
                  `https://graph.instagram.com/v25.0/${commentId}/replies`,
                  {
                    method:  "POST",
                    headers: {
                      Authorization:  `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message: publicReply }),
                  },
                );
                const pubData = await pubRes.json() as { id?: string; error?: { message: string } };
                if (pubRes.ok) {
                  console.log(`✅ Public comment reply sent id=${pubData.id}`);
                } else {
                  console.warn(`[publicReply] Failed (${pubRes.status}):`, pubData.error?.message);
                }
              } catch (err) {
                console.error("[publicReply] threw:", err);
              }
            }

            /* 2. Private DM */
            if (replyText) {
              const metaId = await sendDM(senderId, replyText);
              await ctx.runMutation(internal.leads.saveOutboundMessage, {
                accountId: account._id as any, leadId, automationId: automation._id,
                messageText: replyText, source: "trigger", metaMessageId: metaId, insideWindow: true,
              });
              await ctx.runMutation(internal.automations.incrementAutomationStats, {
                automationId: automation._id, isNewLead: isNew,
              });
            }

          } else if (automation.listener.type === "smart_ai") {
            const publicReply = automation.listener.message?.igPublicReply;

            /* Public comment reply for Smart AI trigger too */
            if (publicReply && commentId) {
              try {
                const pubRes = await fetch(
                  `https://graph.instagram.com/v25.0/${commentId}/replies`,
                  {
                    method:  "POST",
                    headers: {
                      Authorization:  `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message: publicReply }),
                  },
                );
                const pubData = await pubRes.json() as { id?: string; error?: { message: string } };
                if (pubRes.ok) {
                  console.log(`✅ Public comment reply (AI) sent id=${pubData.id}`);
                } else {
                  console.warn(`[publicReply AI] Failed (${pubRes.status}):`, pubData.error?.message);
                }
              } catch (err) {
                console.error("[publicReply AI] threw:", err);
              }
            }
            await ctx.runAction(internal.ai.startAiConversation, {
              leadId, accountId: account._id as any, automationId: automation._id,
              channel: "instagram", senderId, messageText, accessToken, igUserId,
            });
            /* stats incremented inside startAiConversation */
          }

          if (automation.drip?.enabled && isNew && (automation.drip.steps?.length ?? 0) > 0) {
            await ctx.runMutation(internal.drip.scheduleDrip, {
              accountId: account._id as any, leadId, automationId: automation._id,
              steps: automation.drip.steps, stopOnReply: automation.drip.stopOnReply,
            });
          }
        }
      }
    } catch (err) {
      console.error("[IG webhook] Unhandled error:", err);
    }

    return new Response("OK", { status: 200 });
  }),
});

/* ═══════════════════════════════════════════════════════════
   WHATSAPP WEBHOOK VERIFICATION
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/whatsapp",
  method: "GET",
  handler: httpAction(async (_ctx, req) => {
    const url   = new URL(req.url);
    const mode  = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const chal  = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN)
      return new Response(chal ?? "", { status: 200 });

    return new Response("Forbidden", { status: 403 });
  }),
});

/* ═══════════════════════════════════════════════════════════
   WHATSAPP WEBHOOK
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/whatsapp",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json() as {
      object?: string;
      entry?: Array<{
        changes?: Array<{
          value?: {
            metadata?: { phone_number_id?: string };
            messages?: Array<{ from: string; id: string; text?: { body: string } }>;
          };
        }>;
      }>;
    };

    if (body.object !== "whatsapp_business_account")
      return new Response("OK", { status: 200 });

    await ctx.runMutation(internal.webhooks.logWebhook, {
      source: "whatsapp", eventType: "message", rawPayload: JSON.stringify(body),
    });

    try {
      const value    = body.entry?.[0]?.changes?.[0]?.value;
      const messages = value?.messages;
      const wabaId   = value?.metadata?.phone_number_id;
      if (!messages?.length || !wabaId) return new Response("OK", { status: 200 });

      const msg         = messages[0];
      const senderId    = msg.from;
      const messageText = msg.text?.body ?? "";
      const metaMsgId   = msg.id;
      if (!messageText || !senderId) return new Response("OK", { status: 200 });

      const account = await ctx.runQuery(internal.accounts.getAccountByWhatsAppId, {
        phoneNumberId: wabaId,
      }) as { _id: string; whatsapp?: { accessToken: string } | null } | null;
      if (!account) return new Response("OK", { status: 200 });

      const automation = await ctx.runQuery(internal.automations.findMatchingAutomation, {
        accountId: account._id as any, channel: "whatsapp", triggerType: "wa_message", messageText,
      });
      if (!automation) return new Response("OK", { status: 200 });

      const { leadId, isNew } = await ctx.runMutation(internal.leads.upsertLead, {
        accountId: account._id as any, automationId: automation._id,
        channel: "whatsapp", senderId,
        triggerKeyword: automation.trigger.keywords[0], triggerMessageText: messageText,
      });

      await ctx.runMutation(internal.leads.saveInboundMessage, {
        accountId: account._id as any, leadId, automationId: automation._id,
        messageText, metaMessageId: metaMsgId, sentAt: Date.now(),
      });

      const accessToken = account.whatsapp?.accessToken ?? "";

      if (automation.listener.type === "fixed_message") {
        const text = automation.listener.message?.text ?? "";
        if (text && accessToken) {
          await fetch(`https://graph.facebook.com/v21.0/${wabaId}/messages`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              messaging_product: "whatsapp", to: senderId, type: "text",
              text: { body: text, preview_url: false },
            }),
          });
          await ctx.runMutation(internal.leads.saveOutboundMessage, {
            accountId: account._id as any, leadId, automationId: automation._id,
            messageText: text, source: "trigger", insideWindow: true,
          });
          /* ✅ increment stats */
          await ctx.runMutation(internal.automations.incrementAutomationStats, {
            automationId: automation._id, isNewLead: isNew,
          });
        }
      } else if (automation.listener.type === "smart_ai") {
        await ctx.runAction(internal.ai.startAiConversation, {
          leadId, accountId: account._id as any, automationId: automation._id,
          channel: "whatsapp", senderId, messageText, accessToken, phoneNumberId: wabaId,
        });
        /* stats incremented inside startAiConversation */
      }

      if (automation.drip?.enabled && isNew && (automation.drip.steps?.length ?? 0) > 0) {
        await ctx.runMutation(internal.drip.scheduleDrip, {
          accountId: account._id as any, leadId, automationId: automation._id,
          steps: automation.drip.steps, stopOnReply: automation.drip.stopOnReply,
        });
      }
    } catch (err) {
      console.error("[WA webhook]", err);
    }

    return new Response("OK", { status: 200 });
  }),
});

/* ═══════════════════════════════════════════════════════════
   RAZORPAY WEBHOOK
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/razorpay-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body      = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!signature || !secret) return new Response("Unauthorized", { status: 400 });

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const sigBuf   = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const computed = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0")).join("");
    if (computed !== signature) return new Response("Invalid signature", { status: 400 });

    const event = JSON.parse(body) as {
      event: string;
      payload: {
        subscription: {
          entity: { id: string; plan_id: string; customer_id: string; current_end: number };
        };
      };
    };

    const isActivation = event.event === "subscription.activated" || event.event === "subscription.charged";
    const isCancelled  = event.event === "subscription.cancelled"  || event.event === "subscription.completed";

    if (isActivation || isCancelled) {
      const sub = event.payload.subscription.entity;

      // customer_id is null in test mode — skip that lookup
      if (!sub.customer_id) {
        console.warn("[Razorpay] No customer_id — skipping");
        return new Response("OK", { status: 200 });
      }

      const account = await ctx.runQuery(internal.accounts.getAccountByRazorpayCustomer, {
        razorpayCustomerId: sub.customer_id,
      });
      if (account) {
        const plan = isCancelled ? "starter" :
          sub.plan_id === process.env.RAZORPAY_PLAN_CREATOR_ID  ? "creator"  :
          sub.plan_id === process.env.RAZORPAY_PLAN_SMART_AI_ID ? "smart_ai" : "starter";

        await ctx.runMutation(internal.accounts.updatePlan, {
          accountId: account._id, plan,
          ...(isActivation ? {
            razorpaySubscriptionId:       sub.id,
            subscriptionStatus:           "active",
            subscriptionCurrentPeriodEnd: sub.current_end * 1000,
          } : { subscriptionStatus: "cancelled" }),
        });
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function detectEventType(body: {
  entry?: Array<{ messaging?: unknown[]; changes?: Array<{ field?: string }> }>;
}): string {
  const entry = body.entry?.[0];
  if (entry?.messaging?.length) return "dm";
  return entry?.changes?.[0]?.field ?? "unknown";
}

async function refreshIgToken(
  accessToken: string,
): Promise<{ accessToken: string; tokenExpiresAt: number } | null> {
  try {
    const res = await fetch(
      `https://graph.instagram.com/refresh_access_token?` +
      new URLSearchParams({ grant_type: "ig_refresh_token", access_token: accessToken }),
    );
    if (!res.ok) return null;
    const data = await res.json() as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    return {
      accessToken:    data.access_token,
      tokenExpiresAt: Date.now() + (data.expires_in ?? 5184000) * 1000,
    };
  } catch { return null; }
}