import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

/* ═══════════════════════════════════════════════════════════
   CLERK WEBHOOK — /clerk-webhook
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) return new Response("Not configured", { status: 500 });

    const svixId        = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await req.text();
    type ClerkEvt = {
      type: string;
      data: {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name?: string;
        last_name?:  string;
        image_url?:  string;
      };
    };

    let evt: ClerkEvt;
    try {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(payload, {
        "svix-id":        svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkEvt;
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      await ctx.runMutation(api.accounts.createAccountFromWebhook, {
        clerkUserId: id,
        name:  [first_name, last_name].filter(Boolean).join(" ") || "User",
        email: email_addresses?.[0]?.email_address ?? "",
        avatarUrl: image_url ?? undefined,
      });
      console.log(`[Clerk] ✅ Account created for clerk user ${id}`);
    }

    return new Response("OK", { status: 200 });
  }),
});

/* ═══════════════════════════════════════════════════════════
   INSTAGRAM OAUTH CALLBACK — /instagram-oauth-callback

   Flow (Instagram Login — no Facebook required):
   1. User clicks Connect → api.instagram.com/oauth/authorize
   2. User approves → Instagram redirects here with ?code=xxx
   3. Exchange code → short-lived token
   4. Exchange → long-lived token (60 days)
   5. Fetch IG profile
   6. Find OR CREATE Convex account (handles missing webhook case)
   7. Save Instagram connection → redirect to /settings?ig_connected=1
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/instagram-oauth-callback",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url    = new URL(req.url);
    const code   = url.searchParams.get("code");
    const state  = url.searchParams.get("state"); // clerkUserId
    const error  = url.searchParams.get("error");

    const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const siteUrl     = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";
    const appId       = process.env.META_APP_ID;
    const appSecret   = process.env.META_APP_SECRET;
    const redirectUri = `${siteUrl}/instagram-oauth-callback`;

    console.log("[IG OAuth] Callback received:", { code: !!code, state, error });

    if (error || !code || !state) {
      console.warn("[IG OAuth] Missing params:", { error, code: !!code, state: !!state });
      return Response.redirect(`${appUrl}/settings?ig_error=access_denied`);
    }

    if (!appId || !appSecret) {
      console.error("[IG OAuth] Missing META_APP_ID or META_APP_SECRET in Convex env vars");
      return Response.redirect(`${appUrl}/settings?ig_error=config_missing`);
    }

    try {
      /* ── Step 1: Exchange code for short-lived token ────── */
      console.log("[IG OAuth] Step 1: Exchanging code for token...");
      const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id:     appId,
          client_secret: appSecret,
          grant_type:    "authorization_code",
          redirect_uri:  redirectUri,
          code,
        }).toString(),
      });

      const tokenData = await tokenRes.json() as {
        access_token?: string;
        user_id?:      number;
        error_type?:   string;
        error_message?: string;
      };

      console.log("[IG OAuth] Short token response:", {
        hasToken: !!tokenData.access_token,
        userId:   tokenData.user_id,
        error:    tokenData.error_message,
      });

      if (!tokenData.access_token) {
        console.error("[IG OAuth] Short-lived token failed:", tokenData);
        return Response.redirect(`${appUrl}/settings?ig_error=token_exchange_failed`);
      }

      /* ── Step 2: Exchange for long-lived token (60 days) ─ */
      console.log("[IG OAuth] Step 2: Exchanging for long-lived token...");
      const llRes = await fetch(
        `https://graph.instagram.com/access_token?` +
        new URLSearchParams({
          grant_type:    "ig_exchange_token",
          client_secret: appSecret,
          access_token:  tokenData.access_token,
        }).toString()
      );

      const llData = await llRes.json() as {
        access_token?: string;
        expires_in?:   number;
        error?:        { message: string };
      };

      console.log("[IG OAuth] Long-lived token response:", {
        hasToken:  !!llData.access_token,
        expiresIn: llData.expires_in,
        error:     llData.error?.message,
      });

      if (!llData.access_token) {
        console.error("[IG OAuth] Long-lived token failed:", llData);
        return Response.redirect(`${appUrl}/settings?ig_error=token_exchange_failed`);
      }

      const accessToken = llData.access_token;
      const expiresIn   = llData.expires_in ?? 5184000; // 60 days

      /* ── Step 3: Get Instagram profile ───────────────────── */
      console.log("[IG OAuth] Step 3: Fetching Instagram profile...");
      const profileRes = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url&access_token=${accessToken}`
      );

      const profile = await profileRes.json() as {
        id?:                  string;
        username?:            string;
        name?:                string;
        profile_picture_url?: string;
        error?:               { message: string };
      };

      console.log("[IG OAuth] Profile response:", {
        id:       profile.id,
        username: profile.username,
        error:    profile.error?.message,
      });

      if (!profile.id) {
        console.error("[IG OAuth] Profile fetch failed:", profile);
        return Response.redirect(`${appUrl}/settings?ig_error=profile_fetch_failed`);
      }

      /* ── Step 4: Find OR CREATE the Convex account ────────
         This handles the common case where the Clerk webhook
         never fired so no account record exists yet.
      ────────────────────────────────────────────────────── */
      console.log("[IG OAuth] Step 4: Finding account for clerkUserId:", state);

      let account = await ctx.runQuery(internal.accounts.getAccountByClerkId, {
        clerkUserId: state,
      }) as { _id: string } | null;

      console.log("[IG OAuth] Account found:", !!account);

      // Account missing — create it now using just the clerk user ID
      // We don't have name/email here, so use Instagram profile data as fallback
      if (!account) {
        console.log("[IG OAuth] Account not found — creating from Instagram profile data...");
        try {
          await ctx.runMutation(api.accounts.createAccountFromWebhook, {
            clerkUserId: state,
            name:        profile.username ?? profile.name ?? "User",
            email:       `${profile.username ?? state}@instagram.placeholder`,
            avatarUrl:   profile.profile_picture_url,
          });

          // Fetch the newly created account
          account = await ctx.runQuery(internal.accounts.getAccountByClerkId, {
            clerkUserId: state,
          }) as { _id: string } | null;

          console.log("[IG OAuth] Account created:", !!account);
        } catch (createErr) {
          console.error("[IG OAuth] Failed to create account:", createErr);
          return Response.redirect(`${appUrl}/settings?ig_error=account_not_found`);
        }
      }

      if (!account) {
        console.error("[IG OAuth] Account still null after create attempt");
        return Response.redirect(`${appUrl}/settings?ig_error=account_not_found`);
      }

      /* ── Step 5: Save Instagram connection ───────────────── */
      console.log("[IG OAuth] Step 5: Saving Instagram connection...");
      await ctx.runMutation(internal.accounts.connectInstagramInternal, {
        accountId: account._id as any,
        igUserId:        profile.id,
        igUsername:      profile.username ?? profile.name ?? "unknown",
        igProfilePicUrl: profile.profile_picture_url,
        accessToken,
        tokenExpiresAt:  Date.now() + expiresIn * 1000,
        pageId:          profile.id,
      });

      console.log(`[IG OAuth] ✅ Successfully connected @${profile.username ?? profile.id}`);
      return Response.redirect(`${appUrl}/settings?ig_connected=1`);

    } catch (err) {
      console.error("[IG OAuth] Unexpected error:", err);
      return Response.redirect(`${appUrl}/settings?ig_error=unknown`);
    }
  }),
});

/* ═══════════════════════════════════════════════════════════
   WHATSAPP WEBHOOK VERIFICATION — GET /whatsapp
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/whatsapp",
  method: "GET",
  handler: httpAction(async (_ctx, req) => {
    const url   = new URL(req.url);
    const mode  = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const chal  = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return new Response(chal ?? "", { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }),
});

/* ═══════════════════════════════════════════════════════════
   WHATSAPP WEBHOOK — POST /whatsapp
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

    if (body.object !== "whatsapp_business_account") return new Response("OK", { status: 200 });

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
        accountId:   account._id as any, // eslint-disable-line
        channel:     "whatsapp",
        triggerType: "wa_message",
        messageText,
      });
      if (!automation) return new Response("OK", { status: 200 });

      const { leadId, isNew } = await ctx.runMutation(internal.leads.upsertLead, {
        accountId:          account._id as any, // eslint-disable-line
        automationId:       automation._id,
        channel:            "whatsapp",
        senderId,
        triggerKeyword:     automation.trigger.keywords[0],
        triggerMessageText: messageText,
      });

      await ctx.runMutation(internal.leads.saveInboundMessage, {
        accountId:     account._id as any, // eslint-disable-line
        leadId,
        automationId:  automation._id,
        messageText,
        metaMessageId: metaMsgId,
        sentAt:        Date.now(),
      });

      const accessToken = account.whatsapp?.accessToken ?? "";

      if (automation.listener.type === "fixed_message") {
        const text = automation.listener.message?.text ?? "";
        if (text && accessToken) {
          await fetch(`https://graph.facebook.com/v21.0/${wabaId}/messages`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: senderId, type: "text",
              text: { body: text, preview_url: false },
            }),
          });
          await ctx.runMutation(internal.leads.saveOutboundMessage, {
            accountId: account._id as any, leadId, automationId: automation._id, // eslint-disable-line
            messageText: text, source: "trigger", insideWindow: true,
          });
        }
      } else if (automation.listener.type === "smart_ai") {
        await ctx.runAction(internal.ai.startAiConversation, {
          leadId,
          accountId:     account._id as any, // eslint-disable-line
          automationId:  automation._id,
          channel:       "whatsapp",
          senderId, messageText, accessToken,
          phoneNumberId: wabaId,
        });
      }

      if (automation.drip?.enabled && isNew && (automation.drip.steps?.length ?? 0) > 0) {
        await ctx.runMutation(internal.drip.scheduleDrip, {
          accountId:   account._id as any, leadId, automationId: automation._id, // eslint-disable-line
          steps:       automation.drip.steps,
          stopOnReply: automation.drip.stopOnReply,
        });
      }

    } catch (err) {
      console.error("[WA webhook]", err);
    }

    return new Response("OK", { status: 200 });
  }),
});

/* ═══════════════════════════════════════════════════════════
   INSTAGRAM WEBHOOK VERIFICATION — GET /instagram
═══════════════════════════════════════════════════════════ */
http.route({
  path: "/instagram",
  method: "GET",
  handler: httpAction(async (_ctx, req) => {
    const url   = new URL(req.url);
    const mode  = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const chal  = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
      return new Response(chal ?? "", { status: 200 });
    }
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
          sender?: { id: string };
          message?: { text?: string; mid?: string };
        }>;
        changes?: Array<{
          field?: string;
          value?: {
            id?:    string;
            text?:  string;
            from?:  { id: string };
            media?: { id: string };
          };
        }>;
      }>;
    };

    if (body.object !== "instagram") return new Response("OK", { status: 200 });

    try {
      const entry    = body.entry?.[0];
      const igUserId = entry?.id;
      if (!igUserId) return new Response("OK", { status: 200 });

      const account = await ctx.runQuery(internal.accounts.getAccountByIgUserId, {
        igUserId,
      }) as { _id: string; instagram?: { accessToken: string } | null } | null;

      if (!account?.instagram?.accessToken) return new Response("OK", { status: 200 });

      const accessToken = account.instagram.accessToken;
      const accountId   = account._id as any; // eslint-disable-line

      /* ── DMs ───────────────────────────────────────────── */
      const messaging = entry?.messaging?.[0];
      if (messaging?.message?.text) {
        const senderId    = messaging.sender?.id ?? "";
        const messageText = messaging.message.text;
        const metaMsgId   = messaging.message.mid;
        if (!senderId) return new Response("OK", { status: 200 });

        const automation = await ctx.runQuery(internal.automations.findMatchingAutomation, {
          accountId, channel: "instagram", triggerType: "ig_dm", messageText,
        });

        if (automation) {
          const { leadId, isNew } = await ctx.runMutation(internal.leads.upsertLead, {
            accountId, automationId: automation._id, channel: "instagram", senderId,
            triggerKeyword: automation.trigger.keywords[0], triggerMessageText: messageText,
          });
          await ctx.runMutation(internal.leads.saveInboundMessage, {
            accountId, leadId, automationId: automation._id,
            messageText, metaMessageId: metaMsgId, sentAt: Date.now(),
          });

          if (automation.listener.type === "fixed_message") {
            const text = automation.listener.message?.text ?? "";
            if (text) {
              await fetch("https://graph.facebook.com/v21.0/me/messages", {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ recipient: { id: senderId }, message: { text }, messaging_type: "RESPONSE" }),
              });
              await ctx.runMutation(internal.leads.saveOutboundMessage, {
                accountId, leadId, automationId: automation._id,
                messageText: text, source: "trigger", insideWindow: true,
              });
            }
          } else if (automation.listener.type === "smart_ai") {
            await ctx.runAction(internal.ai.startAiConversation, {
              leadId, accountId: account._id as any, automationId: automation._id, // eslint-disable-line
              channel: "instagram", senderId, messageText, accessToken,
            });
          }

          if (automation.drip?.enabled && isNew && (automation.drip.steps?.length ?? 0) > 0) {
            await ctx.runMutation(internal.drip.scheduleDrip, {
              accountId: account._id as any, leadId, automationId: automation._id, // eslint-disable-line
              steps: automation.drip.steps, stopOnReply: automation.drip.stopOnReply,
            });
          }
        }
      }

      /* ── Comments ─────────────────────────────────────── */
      const change = entry?.changes?.[0];
      if (change?.field === "comments" || change?.field === "mention") {
        const comment     = change.value;
        const senderId    = comment?.from?.id ?? "";
        const messageText = comment?.text ?? "";
        const postId      = comment?.media?.id;
        if (!senderId || !messageText) return new Response("OK", { status: 200 });

        const automation = await ctx.runQuery(internal.automations.findMatchingAutomation, {
          accountId, channel: "instagram", triggerType: "ig_comment", messageText, igPostId: postId,
        });

        if (automation) {
          const { leadId, isNew } = await ctx.runMutation(internal.leads.upsertLead, {
            accountId, automationId: automation._id, channel: "instagram", senderId,
            triggerKeyword: automation.trigger.keywords[0], triggerMessageText: messageText,
            triggerPostId: postId,
          });
          await ctx.runMutation(internal.leads.saveInboundMessage, {
            accountId, leadId, automationId: automation._id, messageText, sentAt: Date.now(),
          });

          const replyText = automation.listener.type === "fixed_message"
            ? (automation.listener.message?.text ?? "") : null;

          if (replyText) {
            await fetch("https://graph.facebook.com/v21.0/me/messages", {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                recipient: { comment_id: comment?.id },
                message: { text: replyText }, messaging_type: "RESPONSE",
              }),
            });
            await ctx.runMutation(internal.leads.saveOutboundMessage, {
              accountId: account._id as any, leadId, automationId: automation._id, // eslint-disable-line
              messageText: replyText, source: "trigger", insideWindow: true,
            });
          } else if (automation.listener.type === "smart_ai") {
            await ctx.runAction(internal.ai.startAiConversation, {
              leadId, accountId: account._id as any, automationId: automation._id, // eslint-disable-line
              channel: "instagram", senderId, messageText, accessToken,
            });
          }

          const publicReply = automation.listener.message?.igPublicReply;
          if (publicReply && comment?.id) {
            await fetch(`https://graph.facebook.com/v21.0/${comment.id}/replies`, {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({ message: publicReply }),
            });
          }

          if (automation.drip?.enabled && isNew && (automation.drip.steps?.length ?? 0) > 0) {
            await ctx.runMutation(internal.drip.scheduleDrip, {
              accountId: account._id as any, leadId, automationId: automation._id, // eslint-disable-line
              steps: automation.drip.steps, stopOnReply: automation.drip.stopOnReply,
            });
          }
        }
      }

    } catch (err) {
      console.error("[IG webhook]", err);
    }

    return new Response("OK", { status: 200 });
  }),
});

/* ═══════════════════════════════════════════════════════════
   RAZORPAY WEBHOOK — /razorpay-webhook
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
      "raw", encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sigBuf  = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const computed = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0")).join("");

    if (computed !== signature) return new Response("Invalid signature", { status: 400 });

    const event = JSON.parse(body) as {
      event: string;
      payload: { subscription: { entity: { id: string; plan_id: string; customer_id: string; current_end: number } } };
    };

    const isActivation = event.event === "subscription.activated" || event.event === "subscription.charged";
    const isCancelled  = event.event === "subscription.cancelled" || event.event === "subscription.completed";

    if (isActivation || isCancelled) {
      const sub     = event.payload.subscription.entity;
      const account = await ctx.runQuery(internal.accounts.getAccountByRazorpayCustomer, {
        razorpayCustomerId: sub.customer_id,
      });

      if (account) {
        const plan = isCancelled ? "starter" :
          sub.plan_id === process.env.RAZORPAY_PLAN_CREATOR_ID  ? "creator"  :
          sub.plan_id === process.env.RAZORPAY_PLAN_SMART_AI_ID ? "smart_ai" : "starter";

        await ctx.runMutation(internal.accounts.updatePlan, {
          accountId: account._id,
          plan,
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

http.route({
  path: "/meta-webhook",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);

    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (
      mode === "subscribe" &&
      token === process.env.INSTAGRAM_VERIFY_TOKEN
    ) {
      console.log("✅ Webhook verified");
      return new Response(challenge, { status: 200 });
    }

    return new Response("Verification failed", { status: 403 });
  }),
});

/* ✅ RECEIVE EVENTS */
http.route({
  path: "/meta-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();

    console.log("📩 WEBHOOK EVENT:");
    console.log(JSON.stringify(body, null, 2));

    return new Response("EVENT_RECEIVED", { status: 200 });
  }),
});


export default http;