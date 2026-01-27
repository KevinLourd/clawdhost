/**
 * Hetzner Cloud API wrapper for server provisioning
 * API Docs: https://docs.hetzner.cloud/
 */

const HETZNER_API_URL = "https://api.hetzner.cloud/v1";

interface HetznerServer {
  id: number;
  name: string;
  status: "initializing" | "starting" | "running" | "stopping" | "off" | "deleting" | "rebuilding" | "migrating" | "unknown";
  public_net: {
    ipv4: {
      ip: string;
    };
    ipv6: {
      ip: string;
    };
  };
  server_type: {
    name: string;
    description: string;
  };
  datacenter: {
    name: string;
    location: {
      name: string;
      city: string;
      country: string;
    };
  };
  created: string;
}

interface CreateServerResponse {
  server: HetznerServer;
  root_password: string;
}

interface HetznerError {
  error: {
    code: string;
    message: string;
  };
}

function getApiToken(): string {
  const token = process.env.HETZNER_API_TOKEN;
  if (!token) {
    throw new Error("HETZNER_API_TOKEN environment variable is not set");
  }
  return token;
}

async function hetznerFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getApiToken();

  const response = await fetch(`${HETZNER_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as HetznerError;
    throw new Error(
      `Hetzner API error: ${error.error?.code || response.status} - ${error.error?.message || "Unknown error"}`
    );
  }

  return data as T;
}

/**
 * Create a new server on Hetzner Cloud
 */
export async function createServer(options: {
  name: string;
  serverType?: string;
  image?: string;
  location?: string;
  sshKeyIds?: number[];
  userData?: string;
}): Promise<CreateServerResponse> {
  const {
    name,
    serverType = "cx42", // 8 vCPU, 16GB RAM - closest to CX43
    image = "ubuntu-24.04",
    location = "fsn1", // Falkenstein, Germany
    sshKeyIds = [],
    userData,
  } = options;

  const body: Record<string, unknown> = {
    name,
    server_type: serverType,
    image,
    location,
    start_after_create: true,
  };

  if (sshKeyIds.length > 0) {
    body.ssh_keys = sshKeyIds;
  }

  if (userData) {
    body.user_data = userData;
  }

  const response = await hetznerFetch<CreateServerResponse>("/servers", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response;
}

/**
 * Get server details by ID
 */
export async function getServer(serverId: number): Promise<HetznerServer> {
  const response = await hetznerFetch<{ server: HetznerServer }>(
    `/servers/${serverId}`
  );
  return response.server;
}

/**
 * Wait for server to be in running state
 */
export async function waitForServerReady(
  serverId: number,
  maxAttempts = 30,
  intervalMs = 5000
): Promise<HetznerServer> {
  for (let i = 0; i < maxAttempts; i++) {
    const server = await getServer(serverId);

    if (server.status === "running") {
      return server;
    }

    if (server.status === "off" || server.status === "deleting") {
      throw new Error(`Server ${serverId} is in unexpected state: ${server.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Server ${serverId} did not become ready after ${maxAttempts} attempts`);
}

/**
 * Delete a server
 */
export async function deleteServer(serverId: number): Promise<void> {
  await hetznerFetch(`/servers/${serverId}`, {
    method: "DELETE",
  });
}

/**
 * List all servers
 */
export async function listServers(): Promise<HetznerServer[]> {
  const response = await hetznerFetch<{ servers: HetznerServer[] }>("/servers");
  return response.servers;
}

/**
 * Get or create an SSH key for ClawdHost provisioning
 */
export async function getOrCreateSshKey(
  name: string,
  publicKey: string
): Promise<number> {
  // First, try to find existing key
  const keysResponse = await hetznerFetch<{
    ssh_keys: { id: number; name: string }[];
  }>("/ssh_keys");

  const existingKey = keysResponse.ssh_keys.find((k) => k.name === name);
  if (existingKey) {
    return existingKey.id;
  }

  // Create new key
  const createResponse = await hetznerFetch<{ ssh_key: { id: number } }>(
    "/ssh_keys",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        public_key: publicKey,
      }),
    }
  );

  return createResponse.ssh_key.id;
}

/**
 * Generate cloud-init user data for ClawdBot installation
 */
export function generateClawdBotUserData(options: {
  customerEmail: string;
  tunnelToken?: string;
}): string {
  const { customerEmail, tunnelToken } = options;

  // Cloud-init script to install ClawdBot
  return `#cloud-config
package_update: true
package_upgrade: true

packages:
  - curl
  - git
  - nodejs
  - npm

runcmd:
  # Install Node.js 20
  - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  - apt-get install -y nodejs
  
  # Create clawdbot user
  - useradd -m -s /bin/bash clawdbot
  
  # Install ClawdBot
  - su - clawdbot -c "curl -fsSL https://clawd.bot/install.sh | bash"
  
  # Save customer info
  - echo "${customerEmail}" > /home/clawdbot/.customer_email
  ${tunnelToken ? `- echo "${tunnelToken}" > /home/clawdbot/.tunnel_token` : ""}
  
  # Set permissions
  - chown clawdbot:clawdbot /home/clawdbot/.customer_email
  
  # Signal completion
  - touch /var/run/clawdbot-installed

final_message: "ClawdBot installation complete"
`;
}
