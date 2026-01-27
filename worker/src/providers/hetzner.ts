/**
 * Hetzner Cloud provider for Linux VPS provisioning
 */

import { Provider, ServerInfo, ProvisionOptions } from "./index";

const HETZNER_API_URL = "https://api.hetzner.cloud/v1";

interface HetznerServerResponse {
  server: {
    id: number;
    name: string;
    status: string;
    public_net: {
      ipv4: { ip: string };
      ipv6: { ip: string };
    };
  };
  root_password: string;
}

function getApiToken(): string {
  const token = process.env.HETZNER_API_TOKEN;
  if (!token) {
    throw new Error("HETZNER_API_TOKEN is not set");
  }
  return token;
}

async function hetznerFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${HETZNER_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiToken()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json() as T & { error?: { message?: string } };

  if (!response.ok) {
    const errorData = data as { error?: { message?: string } };
    throw new Error(`Hetzner API error: ${errorData.error?.message || response.statusText}`);
  }

  return data;
}

export class HetznerProvider implements Provider {
  name = "hetzner";

  async createServer(options: ProvisionOptions): Promise<ServerInfo> {
    const serverName = `clawdhost-${options.planId}-${Date.now()}`;

    console.log(`[Hetzner] Creating server: ${serverName}`);

    const response = await hetznerFetch<HetznerServerResponse>("/servers", {
      method: "POST",
      body: JSON.stringify({
        name: serverName,
        server_type: "cx43", // 8 vCPU, 16GB RAM (Gen3)
        image: "ubuntu-24.04",
        location: "fsn1", // Falkenstein, Germany
        start_after_create: true,
      }),
    });

    console.log(`[Hetzner] Server created with ID: ${response.server.id}`);

    return {
      id: response.server.id.toString(),
      name: serverName,
      ip: response.server.public_net.ipv4.ip,
      status: "creating",
      provider: "hetzner",
      credentials: {
        username: "root",
        password: response.root_password,
      },
    };
  }

  async waitForReady(server: ServerInfo, maxAttempts = 30, intervalMs = 10000): Promise<ServerInfo> {
    console.log(`[Hetzner] Waiting for server ${server.id} to be ready...`);

    for (let i = 0; i < maxAttempts; i++) {
      const current = await this.getServer(server.id);

      if (!current) {
        throw new Error(`Server ${server.id} not found`);
      }

      if (current.status === "running") {
        // Also wait for SSH to be available
        const sshReady = await this.waitForSsh(current.ip, 20, 15000);
        if (sshReady) {
          console.log(`[Hetzner] Server ${server.id} is ready at ${current.ip}`);
          return { ...server, ...current, status: "running" };
        }
      }

      console.log(`[Hetzner] Server status: ${current.status}, attempt ${i + 1}/${maxAttempts}`);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Server ${server.id} did not become ready after ${maxAttempts} attempts`);
  }

  private async waitForSsh(ip: string, maxAttempts = 20, intervalMs = 15000): Promise<boolean> {
    const net = await import("net");

    for (let i = 0; i < maxAttempts; i++) {
      try {
        await new Promise<void>((resolve, reject) => {
          const socket = new net.Socket();
          socket.setTimeout(5000);

          socket.on("connect", () => {
            socket.destroy();
            resolve();
          });

          socket.on("error", reject);
          socket.on("timeout", () => {
            socket.destroy();
            reject(new Error("Timeout"));
          });

          socket.connect(22, ip);
        });

        console.log(`[Hetzner] SSH available on ${ip}`);
        return true;
      } catch {
        console.log(`[Hetzner] SSH not ready on ${ip}, attempt ${i + 1}/${maxAttempts}`);
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    return false;
  }

  async deleteServer(serverId: string): Promise<void> {
    console.log(`[Hetzner] Deleting server: ${serverId}`);

    await hetznerFetch(`/servers/${serverId}`, {
      method: "DELETE",
    });

    console.log(`[Hetzner] Server ${serverId} deleted`);
  }

  async getServer(serverId: string): Promise<ServerInfo | null> {
    try {
      const response = await hetznerFetch<{ server: HetznerServerResponse["server"] }>(
        `/servers/${serverId}`
      );

      const statusMap: Record<string, ServerInfo["status"]> = {
        initializing: "creating",
        starting: "creating",
        running: "running",
        stopping: "stopped",
        off: "stopped",
      };

      return {
        id: response.server.id.toString(),
        name: response.server.name,
        ip: response.server.public_net.ipv4.ip,
        status: statusMap[response.server.status] || "error",
        provider: "hetzner",
        credentials: {
          username: "root",
        },
      };
    } catch {
      return null;
    }
  }
}

export const hetznerProvider = new HetznerProvider();
