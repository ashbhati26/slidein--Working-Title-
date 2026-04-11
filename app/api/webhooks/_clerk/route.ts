import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const payload = await req.text();
  const headerPayload = await headers();

  const svix_id        = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Verify signature in Next.js — NEVER pass secret to Convex
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id":        svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // Handle user.created
  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";
    const email = email_addresses?.[0]?.email_address ?? "";

    try {
      await convex.mutation(api.accounts.createAccountFromWebhook, {
        clerkUserId: id,
        name,
        email,
        avatarUrl:   image_url ?? undefined,
      });
      console.log(`[Clerk webhook] Account created for ${email}`);
    } catch (err) {
      console.error("[Clerk webhook] Failed to create account:", err);
      // Return 200 anyway — Clerk will retry on non-2xx, we don't want loops
    }
  }

  return new Response("OK", { status: 200 });
}