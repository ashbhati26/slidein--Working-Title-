import { NextRequest, NextResponse } from "next/server";

const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json() as { subscriptionId?: string };

    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
    }

    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const res = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
      {
        method:  "POST",
        headers: {
          Authorization:  `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancel_at_cycle_end: 1 }),
      }
    );

    const data = await res.json() as {
      id?:     string;
      status?: string;
      error?:  { description: string };
    };

    if (!res.ok) {
      console.error("[Billing] Cancel failed:", data.error);
      return NextResponse.json(
        { error: data.error?.description ?? "Failed to cancel subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: data.status });

  } catch (err) {
    console.error("[Billing] cancel-subscription error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}