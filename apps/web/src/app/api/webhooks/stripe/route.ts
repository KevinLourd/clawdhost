import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendWelcomeEmail, sendProvisioningStartedEmail } from "@/lib/email";
import { sendPurchaseEvent } from "@/lib/meta";
import { triggerProvisioning, triggerDeprovisioning } from "@/lib/provisioning";
import { plans } from "@/lib/plans";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();
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
          
          // Send welcome email (value proposition)
          try {
            await sendWelcomeEmail({
              to: customerEmail,
              customerName: customerName || undefined,
              planName,
            });
            console.log(`Welcome email sent to ${customerEmail}`);
          } catch (error) {
            console.error("Failed to send welcome email:", error);
          }

          // Send provisioning started email (progress update)
          try {
            await sendProvisioningStartedEmail({
              to: customerEmail,
              customerName: customerName || undefined,
              planName,
            });
            console.log(`Provisioning started email sent to ${customerEmail}`);
          } catch (error) {
            console.error("Failed to send provisioning started email:", error);
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
      
      console.log(`Subscription ${subscription.id} was cancelled`);
      
      // Get instance metadata from subscription
      const metadata = subscription.metadata;
      
      if (metadata?.serverId && metadata?.provider) {
        // Get customer email for logging
        let customerEmail = "unknown";
        if (subscription.customer) {
          try {
            const customerId = typeof subscription.customer === "string" 
              ? subscription.customer 
              : subscription.customer.id;
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted && "email" in customer) {
              customerEmail = customer.email || "unknown";
            }
          } catch {
            // Ignore customer fetch errors
          }
        }
        
        // Trigger deprovisioning
        try {
          await triggerDeprovisioning({
            serverId: metadata.serverId,
            tunnelId: metadata.tunnelId || undefined,
            provider: metadata.provider,
            customerEmail,
            reason: "subscription_cancelled",
          });
          console.log(`Deprovisioning triggered for server ${metadata.serverId}`);
        } catch (error) {
          console.error("Failed to trigger deprovisioning:", error);
        }
      } else {
        console.log(`No instance metadata found for subscription ${subscription.id}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
