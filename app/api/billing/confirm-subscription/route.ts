import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subscriptionId, planId } = await req.json() as { subscriptionId: string; planId: string };

  await convex.mutation(api.accounts.saveSubscriptionId, {
    clerkUserId: userId,
    razorpaySubscriptionId: subscriptionId,
    plan: planId as "creator" | "smart_ai",
  });

  return NextResponse.json({ success: true });
}