/**
 * ClawdBot installation service via SSH
 * Installs ClawdBot + ttyd + Cloudflare Tunnel for web terminal access
 */

import { Client } from "ssh2";
import { ServerInfo } from "../providers";

export interface InstallResult {
  success: boolean;
  tunnelUrl?: string;
  error?: string;
}

function executeCommand(
  conn: Client,
  command: string,
  timeoutMs = 120000
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Command timed out: ${command.slice(0, 50)}...`));
    }, timeoutMs);

    conn.exec(command, (err, stream) => {
      if (err) {
        clearTimeout(timeout);
        reject(err);
        return;
      }

      let stdout = "";
      let stderr = "";

      stream.on("close", (code: number) => {
        clearTimeout(timeout);
        resolve({ stdout, stderr, code });
      });

      stream.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      stream.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });
    });
  });
}

function connect(server: ServerInfo): Promise<Client> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on("ready", () => {
      resolve(conn);
    });

    conn.on("error", (err) => {
      reject(err);
    });

    conn.connect({
      host: server.ip,
      port: 22,
      username: server.credentials.username,
      password: server.credentials.password,
      privateKey: server.credentials.privateKey,
      readyTimeout: 30000,
    });
  });
}

export async function installClawdBot(
  server: ServerInfo,
  customerEmail: string,
  customerName?: string
): Promise<InstallResult> {
  let conn: Client | null = null;

  try {
    console.log(`[Installer] Connecting to ${server.ip}...`);
    conn = await connect(server);

    // Step 1: Update system
    console.log("[Installer] Updating system packages...");
    await executeCommand(conn, "apt-get update -y");

    // Step 2: Install dependencies
    console.log("[Installer] Installing dependencies...");
    await executeCommand(
      conn,
      "apt-get install -y curl git build-essential jq"
    );

    // Step 3: Install Node.js 22
    console.log("[Installer] Installing Node.js 22...");
    await executeCommand(
      conn,
      "curl -fsSL https://deb.nodesource.com/setup_22.x | bash -"
    );
    await executeCommand(conn, "apt-get install -y nodejs");

    // Step 4: Create clawdbot user
    console.log("[Installer] Creating clawdbot user...");
    await executeCommand(
      conn,
      "id clawdbot || useradd -m -s /bin/bash clawdbot"
    );

    // Step 5: Install ClawdBot globally
    console.log("[Installer] Installing ClawdBot...");
    await executeCommand(conn, "npm install -g clawdbot@latest", 300000);

    // Step 6: Install ttyd (web terminal)
    console.log("[Installer] Installing ttyd...");
    await executeCommand(conn, "apt-get install -y ttyd");

    // Step 7: Install cloudflared
    console.log("[Installer] Installing cloudflared...");
    await executeCommand(
      conn,
      `curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb && dpkg -i /tmp/cloudflared.deb`
    );

    // Step 8: Create ttyd systemd service (runs as clawdbot user)
    console.log("[Installer] Setting up ttyd service...");
    const ttydService = `[Unit]
Description=ttyd Web Terminal
After=network.target

[Service]
Type=simple
User=clawdbot
ExecStart=/usr/bin/ttyd -W -p 7681 /bin/bash -c "cd ~ && exec bash -l"
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target`;

    await executeCommand(
      conn,
      `cat > /etc/systemd/system/ttyd.service << 'EOFSERVICE'
${ttydService}
EOFSERVICE`
    );

    await executeCommand(conn, "systemctl daemon-reload");
    await executeCommand(conn, "systemctl enable ttyd");
    await executeCommand(conn, "systemctl start ttyd");

    // Step 9: Create cloudflared tunnel service
    console.log("[Installer] Setting up Cloudflare Tunnel...");
    const tunnelService = `[Unit]
Description=Cloudflare Tunnel for ttyd
After=network.target ttyd.service
Requires=ttyd.service

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared tunnel --url http://localhost:7681 --logfile /var/log/cloudflared.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`;

    await executeCommand(
      conn,
      `cat > /etc/systemd/system/cloudflared-tunnel.service << 'EOFSERVICE'
${tunnelService}
EOFSERVICE`
    );

    await executeCommand(conn, "systemctl daemon-reload");
    await executeCommand(conn, "systemctl enable cloudflared-tunnel");
    await executeCommand(conn, "systemctl start cloudflared-tunnel");

    // Step 10: Wait for tunnel URL to appear in logs
    console.log("[Installer] Waiting for tunnel URL...");
    await new Promise((r) => setTimeout(r, 5000)); // Wait for tunnel to start

    let tunnelUrl: string | undefined;
    for (let i = 0; i < 12; i++) {
      const logResult = await executeCommand(
        conn,
        "grep -o 'https://[a-z0-9-]*\\.trycloudflare\\.com' /var/log/cloudflared.log | tail -1"
      );

      if (logResult.stdout.trim()) {
        tunnelUrl = logResult.stdout.trim();
        console.log(`[Installer] Tunnel URL: ${tunnelUrl}`);
        break;
      }

      console.log(`[Installer] Waiting for tunnel... attempt ${i + 1}/12`);
      await new Promise((r) => setTimeout(r, 5000));
    }

    if (!tunnelUrl) {
      throw new Error("Failed to get Cloudflare Tunnel URL");
    }

    // Step 11: Save customer info and tunnel URL
    console.log("[Installer] Saving customer info...");
    await executeCommand(
      conn,
      `echo "${customerEmail}" > /home/clawdbot/.customer_email`
    );
    await executeCommand(
      conn,
      `echo "${tunnelUrl}" > /home/clawdbot/.tunnel_url`
    );
    if (customerName) {
      await executeCommand(
        conn,
        `echo "${customerName}" > /home/clawdbot/.customer_name`
      );
    }
    await executeCommand(
      conn,
      "chown clawdbot:clawdbot /home/clawdbot/.customer_* /home/clawdbot/.tunnel_url"
    );

    console.log("[Installer] Installation complete!");
    conn.end();

    return { success: true, tunnelUrl };
  } catch (error) {
    console.error("[Installer] Error:", error);

    if (conn) {
      conn.end();
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
