import { NextRequest, NextResponse } from "next/server";

const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

const PLAN_MAP: Record<string, string> = {
  creator:  process.env.RAZORPAY_PLAN_CREATOR_ID  ?? "",
  smart_ai: process.env.RAZORPAY_PLAN_SMART_AI_ID ?? "",
};

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json() as { planId?: string };

    if (!planId || !PLAN_MAP[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
    }

    const razorpayPlanId = PLAN_MAP[planId];
    const credentials    = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method:  "POST",
      headers: {
        Authorization:  `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id:         razorpayPlanId,
        quantity:        1,
        total_count:     120,
        customer_notify: 1,
      }),
    });

    const data = await res.json() as {
      id?:    string;
      error?: { description: string };
    };

    if (!res.ok || !data.id) {
      console.error("[Billing] Razorpay error:", data.error);
      return NextResponse.json(
        { error: data.error?.description ?? "Failed to create subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ subscriptionId: data.id });

  } catch (err) {
    console.error("[Billing] create-subscription error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}