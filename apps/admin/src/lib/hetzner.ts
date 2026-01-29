const WORKER_URL = process.env.WORKER_URL;
const WORKER_SECRET = process.env.WORKER_SECRET;

interface DeprovisionParams {
  serverId: string;
  tunnelId?: string;
  provider: string;
  customerEmail: string;
  reason?: string;
}

/**
 * Delete a server via the worker service
 * The worker handles Hetzner API calls and Cloudflare tunnel cleanup
 */
export async function deprovisionServer(params: DeprovisionParams): Promise<{ success: boolean; error?: string }> {
  if (!WORKER_URL || !WORKER_SECRET) {
    return { success: false, error: "WORKER_URL or WORKER_SECRET not configured" };
  }

  try {
    const response = await fetch(`${WORKER_URL}/deprovision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      return { success: true };
    }

    // 404 or already deleted is fine
    if (response.status === 404) {
      return { success: true };
    }

    const data = await response.json();
    return { success: false, error: data.error || data.message || "Unknown error" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
