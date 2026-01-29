/**
 * Stripe service for managing subscription metadata
 */

import Stripe from "stripe";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey);
}

interface InstanceMetadata {
  serverId: string;
  tunnelId?: string;
  serverIp: string;
  provider: string;
  terminalUrl: string;
  provisionedAt: string;
}

/**
 * Save instance metadata to Stripe subscription
 */
export async function saveInstanceToSubscription(
  subscriptionId: string,
  metadata: InstanceMetadata
): Promise<void> {
  const stripe = getStripeClient();

  console.log(`[Stripe] Saving instance metadata to subscription ${subscriptionId}`);

  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      serverId: metadata.serverId,
      tunnelId: metadata.tunnelId || "",
      serverIp: metadata.serverIp,
      provider: metadata.provider,
      terminalUrl: metadata.terminalUrl,
      provisionedAt: metadata.provisionedAt,
    },
  });

  console.log(`[Stripe] Metadata saved successfully`);
}

/**
 * Get instance metadata from Stripe subscription
 */
export async function getInstanceFromSubscription(
  subscriptionId: string
): Promise<InstanceMetadata | null> {
  const stripe = getStripeClient();

  console.log(`[Stripe] Getting instance metadata from subscription ${subscriptionId}`);

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (!subscription.metadata?.serverId) {
    console.log(`[Stripe] No instance metadata found`);
    return null;
  }

  return {
    serverId: subscription.metadata.serverId,
    tunnelId: subscription.metadata.tunnelId || undefined,
    serverIp: subscription.metadata.serverIp,
    provider: subscription.metadata.provider,
    terminalUrl: subscription.metadata.terminalUrl,
    provisionedAt: subscription.metadata.provisionedAt,
  };
}
