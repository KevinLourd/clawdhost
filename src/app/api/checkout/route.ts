import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { plans } from "@/lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Map plan IDs to Stripe price IDs (you'll need to create these in Stripe Dashboard)
const stripePriceIds: Record<string, string> = {
  linux: process.env.STRIPE_PRICE_LINUX || "",
  "macos-m1": process.env.STRIPE_PRICE_MACOS_M1 || "",
  "macos-m4": process.env.STRIPE_PRICE_MACOS_M4 || "",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId } = body;

    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = stripePriceIds[planId];
    
    // If no Stripe price ID is configured, create a checkout with price_data
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: `ClawdBot Day - ${plan.name}`,
              description: plan.description,
            },
            unit_amount: plan.price * 100,
            recurring: { interval: plan.interval },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [lineItem],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      metadata: {
        planId: plan.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
