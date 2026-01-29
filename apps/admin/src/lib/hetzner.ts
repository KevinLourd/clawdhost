const HETZNER_API_TOKEN = process.env.HETZNER_API_TOKEN;
const HETZNER_API_URL = "https://api.hetzner.cloud/v1";

export async function deleteHetznerServer(serverId: string): Promise<{ success: boolean; error?: string }> {
  if (!HETZNER_API_TOKEN) {
    return { success: false, error: "HETZNER_API_TOKEN not configured" };
  }

  try {
    const response = await fetch(`${HETZNER_API_URL}/servers/${serverId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${HETZNER_API_TOKEN}`,
      },
    });

    if (response.ok || response.status === 404) {
      // 404 means already deleted, which is fine
      return { success: true };
    }

    const data = await response.json();
    return { success: false, error: data.error?.message || "Unknown error" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getHetznerServer(serverId: string): Promise<{ exists: boolean; server?: unknown }> {
  if (!HETZNER_API_TOKEN) {
    return { exists: false };
  }

  try {
    const response = await fetch(`${HETZNER_API_URL}/servers/${serverId}`, {
      headers: {
        Authorization: `Bearer ${HETZNER_API_TOKEN}`,
      },
    });

    if (response.status === 404) {
      return { exists: false };
    }

    if (response.ok) {
      const data = await response.json();
      return { exists: true, server: data.server };
    }

    return { exists: false };
  } catch {
    return { exists: false };
  }
}
