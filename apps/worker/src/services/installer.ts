/**
 * ClawdBot installation checker
 * Cloud-init handles the actual installation, this configures and starts the bot
 */

import { Client } from "ssh2";
import { ServerInfo } from "../providers";

export interface MoltBotConfig {
  auth?: {
    anthropicKey?: string;
  };
  channels?: {
    telegram?: {
      botToken?: string;
      botUsername?: string;
      ownerUsername?: string; // Telegram username of the owner to pre-approve
    };
  };
}

export interface InstallResult {
  success: boolean;
  tunnelUrl?: string;
  error?: string;
}

function executeCommand(
  conn: Client,
  command: string,
  timeoutMs = 60000
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Command timed out after ${timeoutMs / 1000}s`));
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

async function checkTtydReady(ip: string): Promise<boolean> {
  const net = await import("net");
  
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(7681, ip);
  });
}

export async function installClawdBot(
  server: ServerInfo,
  customerEmail: string,
  customerName?: string,
  moltbotConfig?: MoltBotConfig
): Promise<InstallResult> {
  console.log(`[Installer] Waiting for cloud-init to complete on ${server.ip}...`);

  // Wait for ttyd to be ready (indicates cloud-init completed) - up to 10 minutes
  const maxAttempts = 40;
  const intervalMs = 15000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Installer] Checking if ttyd is ready, attempt ${attempt}/${maxAttempts}`);
    
    // Check if ttyd is responding on port 7681
    const ttydReady = await checkTtydReady(server.ip);
    
    if (ttydReady) {
      console.log("[Installer] ttyd is responding! Cloud-init completed.");
      
      // Configure MoltBot via SSH
      let conn: Client | null = null;
      
      try {
        conn = await connect(server);
        
        // Save customer info
        await executeCommand(conn, `echo "${customerEmail}" > /home/clawdbot/.customer_email`);
        if (customerName) {
          await executeCommand(conn, `echo "${customerName}" > /home/clawdbot/.customer_name`);
        }
        await executeCommand(conn, "chown -R clawdbot:clawdbot /home/clawdbot/.customer_* 2>/dev/null || true");
        
        // Write ClawdBot config if provided
        if (moltbotConfig && (moltbotConfig.auth?.anthropicKey || moltbotConfig.channels?.telegram)) {
          console.log("[Installer] Writing ClawdBot config...");
          
          // Create the config directory and required subdirs
          await executeCommand(conn, "mkdir -p /home/clawdbot/.clawdbot/agents/main/sessions /home/clawdbot/.clawdbot/credentials /home/clawdbot/clawd");
          
          // Build the clawdbot.json config
          const ownerUsername = moltbotConfig.channels?.telegram?.ownerUsername;
          const config = {
            gateway: {
              mode: "local",
            },
            agents: {
              defaults: {
                workspace: "~/clawd",
                model: "claude-opus-4-5-20251101",
              },
            },
            ...(moltbotConfig.channels?.telegram && {
              channels: {
                telegram: {
                  botToken: moltbotConfig.channels.telegram.botToken,
                  enabled: true,
                  // Use allowlist policy so allowFrom is respected
                  dmPolicy: ownerUsername ? "allowlist" : "pairing",
                  // Pre-approve the owner so they don't need pairing code
                  ...(ownerUsername && { allowFrom: [ownerUsername] }),
                },
              },
            }),
          };
          
          // Write config file (must be clawdbot.json, not moltbot.json)
          const configJson = JSON.stringify(config, null, 2).replace(/"/g, '\\"');
          await executeCommand(conn, `echo "${configJson}" > /home/clawdbot/.clawdbot/clawdbot.json`);
          
          // Write Anthropic key to separate file (more secure)
          if (moltbotConfig.auth?.anthropicKey) {
            await executeCommand(conn, `echo "ANTHROPIC_API_KEY=${moltbotConfig.auth.anthropicKey}" > /home/clawdbot/.clawdbot/.env`);
          }
          
          // Set permissions
          await executeCommand(conn, "chown -R clawdbot:clawdbot /home/clawdbot/.clawdbot /home/clawdbot/clawd");
          await executeCommand(conn, "chmod 700 /home/clawdbot/.clawdbot");
          await executeCommand(conn, "chmod 600 /home/clawdbot/.clawdbot/.env /home/clawdbot/.clawdbot/clawdbot.json 2>/dev/null || true");
          
          console.log("[Installer] ClawdBot config written");
          
          // Create systemd service for gateway (systemctl --user doesn't work on headless servers)
          console.log("[Installer] Creating ClawdBot gateway systemd service...");
          const serviceContent = `[Unit]
Description=ClawdBot Gateway
After=network.target

[Service]
Type=simple
User=clawdbot
Group=clawdbot
WorkingDirectory=/home/clawdbot
EnvironmentFile=/home/clawdbot/.clawdbot/.env
ExecStart=/usr/bin/clawdbot gateway run --allow-unconfigured
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`;
          
          await executeCommand(conn, `cat > /etc/systemd/system/clawdbot-gateway.service << 'SERVICEEOF'
${serviceContent}
SERVICEEOF`);
          
          // Enable and start the service
          await executeCommand(conn, "systemctl daemon-reload");
          await executeCommand(conn, "systemctl enable clawdbot-gateway");
          await executeCommand(conn, "systemctl start clawdbot-gateway");
          
          console.log("[Installer] ClawdBot gateway service started");
        }

        conn.end();
        console.log(`[Installer] Configuration complete`);
        
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        console.log(`[Installer] SSH configuration failed: ${errMsg}`);
        if (conn) conn.end();
        // Log but don't fail - user can configure manually
      }

      // Success - tunnel URL is handled by the provisioning route
      return { success: true };
    } else {
      console.log(`[Installer] ttyd not ready yet on port 7681`);
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return {
    success: false,
    error: `Cloud-init did not complete after ${(maxAttempts * intervalMs) / 60000} minutes`,
  };
}
