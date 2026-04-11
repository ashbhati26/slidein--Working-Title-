import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/* ── Types ─────────────────────────────────────────────────────── */
interface IgPost {
  id:           string;
  caption:      string;
  mediaType:    string;
  thumbnailUrl: string | null;
  timestamp:    string;
  permalink:    string;
}

interface IgAccount {
  instagram?: {
    accessToken:    string;
    igUserId:       string;
    igUsername:     string;
    tokenExpiresAt: number;
  } | null;
}

const IG_GRAPH = "https://graph.instagram.com/v21.0";

/* ── Fetch user's Instagram posts / reels ───────────────────────
   Used in the automation wizard post-selector.
   Calls graph.instagram.com with the stored long-lived token.
─────────────────────────────────────────────────────────────── */
export const fetchMyPosts = action({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }): Promise<IgPost[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.runQuery(
      internal.accounts.getAccountByClerkId,
      { clerkUserId: identity.subject }
    ) as IgAccount | null;

    if (!account?.instagram?.accessToken) {
      throw new Error("Instagram not connected");
    }

    const { accessToken, igUserId } = account.instagram;

    const url = new URL(`${IG_GRAPH}/${igUserId}/media`);
    url.searchParams.set(
      "fields",
      "id,caption,media_type,thumbnail_url,media_url,timestamp,permalink"
    );
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Instagram API error: ${errText}`);
    }

    const data = await res.json() as {
      data?: Array<{
        id:            string;
        caption?:      string;
        media_type:    string;
        thumbnail_url?: string;
        media_url?:    string;
        timestamp:     string;
        permalink:     string;
      }>;
    };

    return (data.data ?? []).map((post) => ({
      id:           post.id,
      caption:      post.caption?.slice(0, 120) ?? "",
      mediaType:    post.media_type,
      thumbnailUrl: post.thumbnail_url ?? post.media_url ?? null,
      timestamp:    post.timestamp,
      permalink:    post.permalink,
    }));
  },
});

/* ── Verify Instagram token is still valid ──────────────────────
   Called on settings page load to show expiry warnings.
─────────────────────────────────────────────────────────────── */
export const verifyInstagramConnection = action({
  args: {},
  handler: async (ctx): Promise<{ valid: boolean; reason?: string; igUserId?: string; username?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { valid: false, reason: "not_authenticated" };

    const account = await ctx.runQuery(
      internal.accounts.getAccountByClerkId,
      { clerkUserId: identity.subject }
    ) as IgAccount | null;

    if (!account?.instagram?.accessToken) {
      return { valid: false, reason: "not_connected" };
    }

    const { accessToken } = account.instagram;

    try {
      const res = await fetch(
        `${IG_GRAPH}/me?fields=id,username&access_token=${accessToken}`
      );

      if (!res.ok) {
        return { valid: false, reason: "token_expired" };
      }

      const data = await res.json() as { id: string; username: string };
      return { valid: true, igUserId: data.id, username: data.username };
    } catch {
      return { valid: false, reason: "network_error" };
    }
  },
});

/* ── Refresh long-lived token (call before it expires) ──────────
   Long-lived tokens can be refreshed if they're at least 24h old
   and haven't expired yet.
─────────────────────────────────────────────────────────────── */
export const refreshInstagramToken = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; newExpiresAt?: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false };

    const account = await ctx.runQuery(
      internal.accounts.getAccountByClerkId,
      { clerkUserId: identity.subject }
    ) as IgAccount | null;

    if (!account?.instagram?.accessToken) return { success: false };

    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) return { success: false };

    const { accessToken } = account.instagram;

    try {
      const res = await fetch(
        `${IG_GRAPH}/refresh_access_token?` +
        new URLSearchParams({
          grant_type:   "ig_refresh_token",
          access_token: accessToken,
        }).toString()
      );

      if (!res.ok) return { success: false };

      const data = await res.json() as { access_token: string; expires_in: number };

      // Update the token in the database via mutation
      await ctx.runMutation(
        internal.accounts.updateInstagramToken,
        {
          clerkUserId:   identity.subject,
          accessToken:   data.access_token,
          tokenExpiresAt: Date.now() + data.expires_in * 1000,
        }
      );

      return { success: true, newExpiresAt: Date.now() + data.expires_in * 1000 };
    } catch {
      return { success: false };
    }
  },
});

// This action revokes the Instagram token from Meta's side,
// then clears the instagram field from the account in DB.
// After this, Instagram will show a fresh login screen on reconnect.

export const disconnectInstagram = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get account with token
    const account = await ctx.runQuery(
      internal.accounts.getAccountByClerkId,
      { clerkUserId: identity.subject }
    ) as {
      _id: string;
      instagram?: { accessToken: string; igUserId: string } | null;
    } | null;

    if (!account) throw new Error("Account not found");

    const accessToken = account.instagram?.accessToken;

    // Step 1 — Revoke token from Instagram/Meta
    // This removes the app authorization so Instagram shows fresh login next time
    if (accessToken) {
      try {
        await fetch(
          `https://graph.instagram.com/me/permissions?access_token=${accessToken}`,
          { method: "DELETE" }
        );
        console.log("[IG Disconnect] Token revoked from Instagram");
      } catch (err) {
        // Non-fatal — still clear from DB even if revoke fails
        console.warn("[IG Disconnect] Token revoke failed (non-fatal):", err);
      }
    }

    // Step 2 — Clear from Convex DB
    await ctx.runMutation(internal.accounts.clearInstagramConnection, {
      clerkUserId: identity.subject,
    });

    console.log("[IG Disconnect] ✅ Instagram disconnected");
    return { success: true };
  },
});