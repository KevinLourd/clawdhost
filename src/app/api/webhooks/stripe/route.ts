import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendWelcomeEmail } from "@/lib/email";
import { sendPurchaseEvent } from "@/lib/meta";
import { triggerProvisioning } from "@/lib/provisioning";
import { plans } from "@/lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.mode === "subscription" && session.payment_status === "paid") {
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name;
        const planId = session.metadata?.planId;
        const customerId = typeof session.customer === "string" 
          ? session.customer 
          : session.customer?.id;
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
        
        if (customerEmail && planId) {
          const plan = plans.find((p) => p.id === planId);
          const planName = plan?.name || planId;
          const planPrice = plan?.price || 0;
          
          // Send welcome email immediately
          try {
            await sendWelcomeEmail({
              to: customerEmail,
              customerName: customerName || undefined,
              planName,
            });
            console.log(`Welcome email sent to ${customerEmail} for plan ${planName}`);
          } catch (error) {
            console.error("Failed to send welcome email:", error);
          }

          // Send Meta Conversions API event
          try {
            await sendPurchaseEvent({
              email: customerEmail,
              eventId: session.id,
              value: planPrice,
              currency: "USD",
            });
          } catch (error) {
            console.error("Failed to send Meta purchase event:", error);
          }

          // Trigger provisioning via Railway worker
          try {
            await triggerProvisioning({
              planId,
              customerEmail,
              customerName: customerName || undefined,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            });
            console.log(`Provisioning triggered for ${customerEmail}`);
          } catch (error) {
            console.error("Failed to trigger provisioning:", error);
          }
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // TODO: Handle subscription cancellation (deprovision instance)
      // 1. Find server by subscription ID in database
      // 2. Delete server on Hetzner/Scaleway
      // 3. Notify customer
      console.log(`Subscription ${subscription.id} was cancelled - TODO: deprovision instance`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
