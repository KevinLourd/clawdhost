/**
 * Cloudflare Tunnel management service
 * Creates named tunnels for each server
 */

const CF_API_URL = "https://api.cloudflare.com/client/v4";

interface TunnelConfig {
  tunnelId: string;
  tunnelToken: string;
  hostname: string;
}

function getConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!apiToken || !accountId || !zoneId) {
    throw new Error("Missing Cloudflare configuration");
  }

  return { apiToken, accountId, zoneId };
}

async function cfFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { apiToken } = getConfig();

  const response = await fetch(`${CF_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = (await response.json()) as {
    success: boolean;
    result: T;
    errors?: { message: string }[];
  };

  if (!data.success) {
    const errorMsg = data.errors?.[0]?.message || "Unknown Cloudflare API error";
    throw new Error(`Cloudflare API error: ${errorMsg}`);
  }

  return data.result;
}

export async function createTunnel(serverName: string): Promise<TunnelConfig> {
  const { accountId, zoneId } = getConfig();
  const tunnelName = `clawdhost-${serverName}`;
  // Use first-level subdomain to be covered by Universal SSL
  // (sub-subdomains like xxx.terminal.clawdhost.tech are NOT covered)
  const hostname = `terminal-${serverName}.clawdhost.tech`;

  console.log(`[Cloudflare] Creating tunnel: ${tunnelName}`);

  // Step 1: Create the tunnel
  const tunnel = await cfFetch<{
    id: string;
    name: string;
    token: string;
  }>(`/accounts/${accountId}/cfd_tunnel`, {
    method: "POST",
    body: JSON.stringify({
      name: tunnelName,
      tunnel_secret: generateTunnelSecret(),
      config_src: "cloudflare",
    }),
  });

  console.log(`[Cloudflare] Tunnel created: ${tunnel.id}`);

  // Step 2: Get tunnel token (API returns the token string directly)
  const tunnelToken = await cfFetch<string>(
    `/accounts/${accountId}/cfd_tunnel/${tunnel.id}/token`,
    { method: "GET" }
  );

  console.log(`[Cloudflare] Got tunnel token: ${tunnelToken ? 'yes' : 'no'}`);

  // Step 3: Configure tunnel ingress (route hostname to localhost:7681)
  await cfFetch(`/accounts/${accountId}/cfd_tunnel/${tunnel.id}/configurations`, {
    method: "PUT",
    body: JSON.stringify({
      config: {
        ingress: [
          {
            hostname: hostname,
            service: "http://localhost:7681",
          },
          {
            service: "http_status:404",
          },
        ],
      },
    }),
  });

  console.log(`[Cloudflare] Configured ingress for ${hostname}`);

  // Step 4: Create DNS CNAME record
  await cfFetch(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: JSON.stringify({
      type: "CNAME",
      name: `terminal-${serverName}`,
      content: `${tunnel.id}.cfargotunnel.com`,
      proxied: true,
      ttl: 1, // Auto
    }),
  });

  console.log(`[Cloudflare] DNS record created: ${hostname}`);

  return {
    tunnelId: tunnel.id,
    tunnelToken: tunnelToken,
    hostname,
  };
}

export async function deleteTunnel(tunnelId: string): Promise<void> {
  const { accountId } = getConfig();

  console.log(`[Cloudflare] Deleting tunnel: ${tunnelId}`);

  // First, clean up connections
  try {
    await cfFetch(`/accounts/${accountId}/cfd_tunnel/${tunnelId}/connections`, {
      method: "DELETE",
    });
  } catch {
    // Ignore - tunnel might not have connections
  }

  // Delete the tunnel
  await cfFetch(`/accounts/${accountId}/cfd_tunnel/${tunnelId}`, {
    method: "DELETE",
  });

  console.log(`[Cloudflare] Tunnel deleted`);
}

function generateTunnelSecret(): string {
  // Generate a 32-byte random secret encoded as base64
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64");
}
