/**
 * Provisioning client - calls the Railway worker
 */

const WORKER_URL = process.env.WORKER_URL;
const WORKER_SECRET = process.env.WORKER_SECRET;

interface ProvisionRequest {
  planId: string;
  customerEmail: string;
  customerName?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

/**
 * Trigger provisioning via the Railway worker
 * Returns immediately, provisioning happens in background
 */
export async function triggerProvisioning(request: ProvisionRequest): Promise<boolean> {
  if (!WORKER_URL || !WORKER_SECRET) {
    console.error("[Provisioning] WORKER_URL or WORKER_SECRET not configured");
    return false;
  }

  try {
    console.log(`[Provisioning] Triggering for ${request.customerEmail}, plan: ${request.planId}`);

    const response = await fetch(`${WORKER_URL}/provision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Provisioning] Worker returned error: ${response.status} - ${error}`);
      return false;
    }

    console.log(`[Provisioning] Successfully triggered for ${request.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Provisioning] Failed to call worker:", error);
    return false;
  }
}
