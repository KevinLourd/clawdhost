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

    // Cloud-init script to install everything at boot
    const cloudInit = this.generateCloudInit(serverName);

    const response = await hetznerFetch<HetznerServerResponse>("/servers", {
      method: "POST",
      body: JSON.stringify({
        name: serverName,
        server_type: "cpx22", // 2 vCPU, 4GB RAM (AMD)
        image: "ubuntu-24.04",
        location: "sin", // Singapore
        start_after_create: true,
        user_data: cloudInit,
      }),
    });

    console.log(`[Hetzner] Server created with ID: ${response.server.id}`);
    console.log(`[Hetzner] Cloud-init will handle installation`);

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

  private generateCloudInit(serverName: string): string {
    return `#cloud-config
package_update: true
package_upgrade: false

packages:
  - curl
  - git
  - build-essential
  - jq
  - ttyd

runcmd:
  # Install Node.js 22
  - curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  - apt-get install -y nodejs
  
  # Create clawdbot user
  - useradd -m -s /bin/bash clawdbot
  
  # Install ClawdBot globally
  - npm install -g clawdbot@latest
  
  # Install cloudflared
  - curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
  - dpkg -i /tmp/cloudflared.deb
  
  # Create ttyd systemd service
  - |
    cat > /etc/systemd/system/ttyd.service << 'EOF'
    [Unit]
    Description=ttyd Web Terminal
    After=network.target
    
    [Service]
    Type=simple
    User=clawdbot
    WorkingDirectory=/home/clawdbot
    ExecStart=/usr/bin/ttyd -p 7681 -W bash
    Restart=always
    RestartSec=3
    
    [Install]
    WantedBy=multi-user.target
    EOF
  
  # Create cloudflared tunnel service
  - |
    cat > /etc/systemd/system/cloudflared-tunnel.service << 'EOF'
    [Unit]
    Description=Cloudflare Tunnel for ttyd
    After=network.target ttyd.service
    Requires=ttyd.service
    
    [Service]
    Type=simple
    ExecStart=/usr/bin/cloudflared tunnel --url http://localhost:7681 --logfile /var/log/cloudflared.log
    Restart=always
    RestartSec=5
    
    [Install]
    WantedBy=multi-user.target
    EOF
  
  # Enable and start services
  - systemctl daemon-reload
  - systemctl enable ttyd.service
  - systemctl start ttyd.service
  - sleep 3
  - systemctl enable cloudflared-tunnel.service
  - systemctl start cloudflared-tunnel.service
  
  # Wait for tunnel URL and save it
  - sleep 15
  - grep -o 'https://[a-z0-9-]*\\.trycloudflare\\.com' /var/log/cloudflared.log > /root/tunnel_url.txt || echo "pending" > /root/tunnel_url.txt
  
  # Mark installation as complete
  - touch /root/.clawdhost-ready

final_message: "ClawdHost setup completed for ${serverName}"
`;
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
          // Preserve original credentials (password only available at creation)
          return {
            ...current,
            status: "running",
            credentials: server.credentials,
          };
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
