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
    // Use provided name or generate one
    const serverName = options.name;

    console.log(`[Hetzner] Creating server: ${serverName}`);
    console.log(`[Hetzner] Tunnel token provided: ${options.tunnelToken ? 'yes' : 'no'}`);
    console.log(`[Hetzner] Terminal password provided: ${options.terminalPassword ? 'yes' : 'no'}`);

    // Cloud-init script to install everything at boot
    const cloudInit = this.generateCloudInit(serverName, options.tunnelToken, options.terminalPassword);

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

  private generateCloudInit(serverName: string, tunnelToken?: string, terminalPassword?: string): string {
    // Use named tunnel if token provided, otherwise fallback to direct IP
    const cloudflaredExecStart = tunnelToken
      ? `/usr/bin/cloudflared tunnel run --token ${tunnelToken}`
      : `/usr/bin/cloudflared tunnel --url http://localhost:7681 --logfile /var/log/cloudflared.log`;
    
    const cloudflaredRestartSec = tunnelToken ? "10" : "60";
    
    // ttyd command with optional basic auth - runs startup script instead of bash
    // -I uses custom index.html with mobile detection (doesn't load app.js on mobile)
    const ttydAuth = terminalPassword ? `-c clawdbot:${terminalPassword}` : '';
    const ttydCommand = `/usr/bin/ttyd -p 7681 -W -I /var/www/ttyd/index.html ${ttydAuth} /home/clawdbot/start.sh`;

    return `#cloud-config
package_update: true
package_upgrade: false

packages:
  - curl
  - git
  - build-essential
  - jq
  - ttyd

write_files:
  - path: /home/clawdbot/start.sh
    permissions: '0755'
    content: |
      #!/bin/bash
      # ClawdHost startup script
      # Auto-runs clawdbot onboard on first connection
      
      MARKER_FILE="$HOME/.clawdbot-onboarded"
      
      if [ ! -f "$MARKER_FILE" ]; then
        echo ""
        echo "Welcome to ClawdBot! Starting the onboarding wizard..."
        echo ""
        clawdbot onboard
        
        # Mark as onboarded after completion
        touch "$MARKER_FILE"
        echo ""
        echo "Onboarding complete! You now have a regular shell."
        echo "Reconnect anytime to manage your ClawdBot."
        echo ""
      fi
      
      # Drop to regular shell
      exec bash

  - path: /var/www/ttyd/index.html
    permissions: '0644'
    content: |
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>ClawdBot Terminal</title>
        <link rel="stylesheet" href="css/xterm.css">
        <link rel="stylesheet" href="css/app.css">
        <style>
          #mobile-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 9999;
            min-height: 100vh;
            background: linear-gradient(135deg, #fdf2f4 0%, #f8f9fa 100%);
            padding: 40px 20px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          #mobile-overlay img { width: 80px; height: 80px; border-radius: 12px; margin-bottom: 24px; }
          #mobile-overlay h1 { font-size: 24px; color: #E87C7C; margin-bottom: 16px; }
          #mobile-overlay p { color: #555; max-width: 400px; margin-bottom: 16px; line-height: 1.6; }
          #mobile-overlay a { color: #E87C7C; text-decoration: none; }
        </style>
        <script>
          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            document.documentElement.classList.add('is-mobile');
          }
        </script>
      </head>
      <body>
        <div id="mobile-overlay">
          <img src="https://clawdhost.tech/clawdhost_logo_27kb.jpg" alt="Clawd Host">
          <div style="font-size:48px;margin-bottom:24px;">💻</div>
          <h1>Open on Desktop</h1>
          <p>The ClawdBot terminal requires a keyboard (arrow keys, etc.).</p>
          <p><strong>Open this link on your computer</strong> to access your ClawdBot.</p>
          <p style="margin-top: 32px; font-size: 14px;"><a href="mailto:support@clawdhost.tech">Need help?</a></p>
        </div>
        <script>
          if (document.documentElement.classList.contains('is-mobile')) {
            document.getElementById('mobile-overlay').style.display = 'flex';
          }
        </script>
        <script src="js/app.js"></script>
      </body>
      </html>

  - path: /etc/systemd/system/clawdhost-ttyd.service
    content: |
      [Unit]
      Description=ClawdHost Web Terminal
      After=network.target
      
      [Service]
      Type=simple
      User=clawdbot
      WorkingDirectory=/home/clawdbot
      ExecStart=${ttydCommand}
      Restart=always
      RestartSec=3
      
      [Install]
      WantedBy=multi-user.target

  - path: /etc/systemd/system/cloudflared-tunnel.service
    content: |
      [Unit]
      Description=Cloudflare Tunnel for ttyd
      After=network.target clawdhost-ttyd.service
      Requires=clawdhost-ttyd.service
      
      [Service]
      Type=simple
      ExecStart=${cloudflaredExecStart}
      Restart=always
      RestartSec=${cloudflaredRestartSec}
      
      [Install]
      WantedBy=multi-user.target

runcmd:
  - chage -d $(date +%Y-%m-%d) root
  - passwd -u root || true
  - mkdir -p /var/www/ttyd
  - curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  - apt-get install -y nodejs
  - useradd -m -s /bin/bash clawdbot
  - echo 'clawdbot ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/clawdbot
  - chmod 440 /etc/sudoers.d/clawdbot
  - chown clawdbot:clawdbot /home/clawdbot/start.sh
  - npm install -g clawdbot@latest
  - apt-get install -y build-essential procps curl file git
  - su - clawdbot -c 'NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  - echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/clawdbot/.bashrc
  - chown clawdbot:clawdbot /home/clawdbot/.bashrc
  - curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
  - dpkg -i /tmp/cloudflared.deb
  - systemctl stop ttyd 2>/dev/null || true
  - systemctl disable ttyd 2>/dev/null || true
  - systemctl daemon-reload
  - systemctl enable clawdhost-ttyd.service
  - systemctl start clawdhost-ttyd.service
  - sleep 3
  - systemctl enable cloudflared-tunnel.service
  - systemctl start cloudflared-tunnel.service
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
