import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/* ─────────────────────────────────────────────────────────────────
   All endpoints use graph.instagram.com — Instagram Login API.
   NO graph.facebook.com. NO pageId. NO page token.
   Token type: Instagram User Access Token (long-lived, 60 days)
───────────────────────────────────────────────────────────────── */

const IG_API = "https://graph.instagram.com/v25.0";

interface IgPost {
  id:           string;
  caption:      string;
  mediaType:    string;
  thumbnailUrl: string | null;
  timestamp:    string;
  permalink:    string;
}

type AccountWithIg = {
  instagram?: {
    accessToken:    string;
    igUserId:       string;
    igUsername:     string;
    tokenExpiresAt: number;
  } | null;
} | null;

/* ── Fetch user's media (posts/reels) ───────────────────────────
   Used in the automation wizard post-selector.
─────────────────────────────────────────────────────────────── */
export const fetchMyPosts = action({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }): Promise<IgPost[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.runQuery(
      internal.accounts.getAccountByClerkId,
      { clerkUserId: identity.subject }
    ) as AccountWithIg;

    if (!account?.instagram?.accessToken) throw new Error("Instagram not connected");

    const { accessToken, igUserId } = account.instagram;

    const url = new URL(`${IG_API}/${igUserId}/media`);
    url.searchParams.set("fields", "id,caption,media_type,thumbnail_url,media_url,timestamp,permalink");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`IG media error: ${await res.text()}`);

    const data = await res.json() as {
      data?: Array<{
        id:             string;
        caption?:       string;
        media_type:     string;
        thumbnail_url?: string;
        media_url?:     string;
        timestamp:      string;
        permalink:      string;
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

/* ── Verify token is still valid ────────────────────────────────
   Called on settings page load.
─────────────────────────────────────────────────────────────── */
export const verifyInstagramConnection = action({
  args: {},
  handler: async (ctx): Promise<{ valid: boolean; reason?: string; username?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { valid: false, reason: "not_authenticated" };

    const account = await ctx.runQuery(
      internal.accounts.getAccountByClerkId,
      { clerkUserId: identity.subject }
    ) as AccountWithIg;

    if (!account?.instagram?.accessToken) return { valid: false, reason: "not_connected" };

    try {
      const res = await fetch(
        `${IG_API}/me?fields=id,username&access_token=${account.instagram.accessToken}`
      );
      if (!res.ok) return { valid: false, reason: "token_expired" };

      const data = await res.json() as { id?: string; username?: string; error?: { message: string } };
      if (data.error || !data.id) return { valid: false, reason: "token_expired" };

      return { valid: true, username: data.username };
    } catch {
      return { valid: false, reason: "network_error" };
    }
  },
});

/* ── Refresh long-lived token ────────────────────────────────────
   Tokens expire in 60 days. Refresh when < 7 days remain.
   Can only refresh if token is at least 24h old.
   Endpoint: GET graph.instagram.com/refresh_access_token
─────────────────────────────────────────────────────────────── */
export const refreshInstagramToken = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; newExpiresAt?: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false };

    const account = await ctx.runQuery(
      internal.accounts.getAccountByClerkId,
      { clerkUserId: identity.subject }
    ) as AccountWithIg;

    if (!account?.instagram?.accessToken) return { success: false };

    try {
      const res = await fetch(
        `https://graph.instagram.com/refresh_access_token?` +
        new URLSearchParams({
          grant_type:   "ig_refresh_token",
          access_token: account.instagram.accessToken,
        })
      );

      if (!res.ok) return { success: false };

      const data = await res.json() as { access_token?: string; expires_in?: number };
      if (!data.access_token) return { success: false };

      const newExpiresAt = Date.now() + (data.expires_in ?? 5184000) * 1000;

      await ctx.runMutation(internal.accounts.updateInstagramToken, {
        clerkUserId:    identity.subject,
        accessToken:    data.access_token,
        tokenExpiresAt: newExpiresAt,
      });

      return { success: true, newExpiresAt };
    } catch {
      return { success: false };
    }
  },
});

/* ── Disconnect Instagram ────────────────────────────────────────
   Revokes token from Meta, then clears from DB.
─────────────────────────────────────────────────────────────── */
export const disconnectInstagram = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const account = await ctx.runQuery(
      internal.accounts.getAccountByClerkId,
      { clerkUserId: identity.subject }
    ) as AccountWithIg;

    const accessToken = account?.instagram?.accessToken;

    // Revoke from Instagram (non-fatal if it fails)
    if (accessToken) {
      try {
        await fetch(`https://graph.instagram.com/me/permissions?access_token=${accessToken}`, {
          method: "DELETE",
        });
      } catch {
        // ignore
      }
    }

    await ctx.runMutation(internal.accounts.clearInstagramConnectionInternal, {
      clerkUserId: identity.subject,
    });

    return { success: true };
  },
});