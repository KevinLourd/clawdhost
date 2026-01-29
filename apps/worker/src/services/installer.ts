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
  customerName?: string
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
      
      // Save customer info via SSH
      let conn: Client | null = null;
      
      try {
        conn = await connect(server);
        
        // Save customer info
        await executeCommand(conn, `echo "${customerEmail}" > /home/clawdbot/.customer_email`);
        if (customerName) {
          await executeCommand(conn, `echo "${customerName}" > /home/clawdbot/.customer_name`);
        }
        await executeCommand(conn, "chown -R clawdbot:clawdbot /home/clawdbot/.customer_* 2>/dev/null || true");

        conn.end();
        console.log(`[Installer] Customer info saved`);
        
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        console.log(`[Installer] SSH for customer info failed: ${errMsg}`);
        if (conn) conn.end();
        // Not critical, continue anyway
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
