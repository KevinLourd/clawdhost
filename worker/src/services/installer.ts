/**
 * ClawdBot installation checker
 * Cloud-init handles the actual installation, this just waits and retrieves the tunnel URL
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

export async function installClawdBot(
  server: ServerInfo,
  customerEmail: string,
  customerName?: string
): Promise<InstallResult> {
  console.log(`[Installer] Waiting for cloud-init to complete on ${server.ip}...`);

  // Wait for cloud-init to complete (up to 10 minutes)
  const maxAttempts = 40;
  const intervalMs = 15000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let conn: Client | null = null;

    try {
      console.log(`[Installer] Checking cloud-init status, attempt ${attempt}/${maxAttempts}`);
      conn = await connect(server);

      // Check if cloud-init is done (the ready marker file exists)
      const readyCheck = await executeCommand(conn, "test -f /root/.clawdhost-ready && echo 'ready'");

      if (readyCheck.stdout.trim() === "ready") {
        console.log("[Installer] Cloud-init completed! Retrieving tunnel URL...");

        // Get tunnel URL - try multiple sources
        let tunnelUrl: string | undefined;

        // First, check the saved file
        const urlFileCheck = await executeCommand(conn, "cat /root/tunnel_url.txt 2>/dev/null");
        if (urlFileCheck.stdout.trim() && urlFileCheck.stdout.includes("trycloudflare.com")) {
          tunnelUrl = urlFileCheck.stdout.trim();
        }

        // If not found, try from cloudflared log
        if (!tunnelUrl) {
          const logCheck = await executeCommand(
            conn,
            "grep -oE 'https://[a-z0-9-]+\\.trycloudflare\\.com' /var/log/cloudflared.log 2>/dev/null | tail -1"
          );
          if (logCheck.stdout.trim()) {
            tunnelUrl = logCheck.stdout.trim();
          }
        }

        // If still not found, wait a bit more and retry
        if (!tunnelUrl) {
          console.log("[Installer] Tunnel URL not ready yet, waiting for cloudflared...");
          await new Promise((r) => setTimeout(r, 15000));

          const retryLog = await executeCommand(
            conn,
            "grep -oE 'https://[a-z0-9-]+\\.trycloudflare\\.com' /var/log/cloudflared.log 2>/dev/null | tail -1"
          );
          if (retryLog.stdout.trim()) {
            tunnelUrl = retryLog.stdout.trim();
          }
        }

        if (!tunnelUrl) {
          // Debug: show service statuses
          const ttydStatus = await executeCommand(conn, "systemctl is-active ttyd 2>/dev/null");
          const cfStatus = await executeCommand(conn, "systemctl is-active cloudflared-tunnel 2>/dev/null");
          const logContent = await executeCommand(conn, "cat /var/log/cloudflared.log 2>/dev/null | tail -30");

          console.log(`[Installer] ttyd status: ${ttydStatus.stdout.trim()}`);
          console.log(`[Installer] cloudflared status: ${cfStatus.stdout.trim()}`);
          console.log(`[Installer] cloudflared log:\n${logContent.stdout}`);

          conn.end();
          throw new Error("Tunnel URL not found after cloud-init completed");
        }

        console.log(`[Installer] Got tunnel URL: ${tunnelUrl}`);

        // Save customer info
        await executeCommand(conn, `echo "${customerEmail}" > /home/clawdbot/.customer_email`);
        if (customerName) {
          await executeCommand(conn, `echo "${customerName}" > /home/clawdbot/.customer_name`);
        }
        await executeCommand(conn, "chown -R clawdbot:clawdbot /home/clawdbot/.customer_* 2>/dev/null || true");

        conn.end();

        return { success: true, tunnelUrl };
      }

      // Show cloud-init progress
      const cloudInitStatus = await executeCommand(conn, "cloud-init status 2>/dev/null || echo 'checking'");
      console.log(`[Installer] Cloud-init status: ${cloudInitStatus.stdout.trim()}`);

      conn.end();
    } catch (error) {
      // Connection failed - might be password change required or server not ready
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      console.log(`[Installer] Connection attempt ${attempt} failed: ${errMsg}`);

      if (conn) {
        try {
          conn.end();
        } catch {
          // Ignore
        }
      }
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return {
    success: false,
    error: `Cloud-init did not complete after ${(maxAttempts * intervalMs) / 60000} minutes`,
  };
}
