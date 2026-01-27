import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { plans } from "@/lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getOrCreatePrice(plan: typeof plans[0]): Promise<string> {
  // Try to find existing product
  const existingProducts = await stripe.products.search({
    query: `metadata['plan_id']:'${plan.id}'`,
  });

  let product: Stripe.Product;

  if (existingProducts.data.length > 0) {
    product = existingProducts.data[0];
  } else {
    // Create new product
    product = await stripe.products.create({
      name: `Clawd Host - ${plan.name}`,
      description: plan.description,
      metadata: {
        plan_id: plan.id,
      },
    });
  }

  // Try to find existing active price for this product
  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    type: "recurring",
  });

  const matchingPrice = existingPrices.data.find(
    (price) =>
      price.unit_amount === plan.price * 100 &&
      price.currency === plan.currency.toLowerCase() &&
      price.recurring?.interval === plan.interval
  );

  if (matchingPrice) {
    return matchingPrice.id;
  }

  // Create new price
  const newPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.price * 100,
    currency: plan.currency.toLowerCase(),
    recurring: {
      interval: plan.interval,
    },
    metadata: {
      plan_id: plan.id,
    },
  });

  return newPrice.id;
}

async function getOrCreateCustomer(email: string): Promise<string> {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const newCustomer = await stripe.customers.create({
    email: email,
  });

  return newCustomer.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, email } = body;

    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get or create the Stripe price
    const priceId = await getOrCreatePrice(plan);

    // Build session options
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      allow_promotion_codes: true,
      metadata: {
        planId: plan.id,
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
        },
      },
    };

    // If email provided, get or create customer
    if (email) {
      const customerId = await getOrCreateCustomer(email);
      sessionOptions.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
