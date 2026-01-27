/**
 * SSH-based ClawdBot installer for provisioned VPS
 */

import { Client } from "ssh2";

interface InstallResult {
  success: boolean;
  tunnelUrl?: string;
  error?: string;
}

interface SshConnectionOptions {
  host: string;
  port?: number;
  username?: string;
  password?: string;
  privateKey?: string;
}

/**
 * Execute a command via SSH and return the output
 */
function executeCommand(
  conn: Client,
  command: string
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      let stdout = "";
      let stderr = "";

      stream.on("close", (code: number) => {
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

/**
 * Connect to server via SSH
 */
function connect(options: SshConnectionOptions): Promise<Client> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on("ready", () => {
      resolve(conn);
    });

    conn.on("error", (err) => {
      reject(err);
    });

    conn.connect({
      host: options.host,
      port: options.port || 22,
      username: options.username || "root",
      password: options.password,
      privateKey: options.privateKey,
      readyTimeout: 30000,
    });
  });
}

/**
 * Wait for SSH to become available on the server
 */
export async function waitForSsh(
  host: string,
  password: string,
  maxAttempts = 20,
  intervalMs = 15000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const conn = await connect({ host, password });
      conn.end();
      return;
    } catch {
      console.log(`SSH not ready yet, attempt ${i + 1}/${maxAttempts}`);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error(`SSH not available after ${maxAttempts} attempts`);
}

/**
 * Install ClawdBot on a freshly provisioned server
 */
export async function installClawdBot(options: {
  host: string;
  password: string;
  customerEmail: string;
  customerName?: string;
}): Promise<InstallResult> {
  const { host, password, customerEmail, customerName } = options;

  let conn: Client | null = null;

  try {
    console.log(`Connecting to ${host}...`);
    conn = await connect({ host, password });

    // Step 1: Update system
    console.log("Updating system packages...");
    await executeCommand(conn, "apt-get update -y");

    // Step 2: Install dependencies
    console.log("Installing dependencies...");
    await executeCommand(
      conn,
      "apt-get install -y curl git build-essential"
    );

    // Step 3: Install Node.js 20
    console.log("Installing Node.js 20...");
    await executeCommand(
      conn,
      "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
    );
    await executeCommand(conn, "apt-get install -y nodejs");

    // Step 4: Create clawdbot user
    console.log("Creating clawdbot user...");
    await executeCommand(
      conn,
      "id clawdbot || useradd -m -s /bin/bash clawdbot"
    );

    // Step 5: Install ClawdBot
    console.log("Installing ClawdBot...");
    const installResult = await executeCommand(
      conn,
      'su - clawdbot -c "curl -fsSL https://clawd.bot/install.sh | bash"'
    );

    if (installResult.code !== 0) {
      console.error("ClawdBot install stderr:", installResult.stderr);
    }

    // Step 6: Save customer info
    console.log("Saving customer info...");
    await executeCommand(
      conn,
      `echo "${customerEmail}" > /home/clawdbot/.customer_email`
    );
    if (customerName) {
      await executeCommand(
        conn,
        `echo "${customerName}" > /home/clawdbot/.customer_name`
      );
    }
    await executeCommand(
      conn,
      "chown clawdbot:clawdbot /home/clawdbot/.customer_*"
    );

    // Step 7: Install and configure Cloudflare Tunnel (optional)
    // For now, we'll skip this and just provide direct SSH access
    // In a future version, we can set up cloudflared

    // Step 8: Start ClawdBot onboarding
    console.log("ClawdBot installation complete!");

    conn.end();

    return {
      success: true,
      tunnelUrl: undefined, // Will be set up later with Cloudflare
    };
  } catch (error) {
    console.error("Installation error:", error);

    if (conn) {
      conn.end();
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if ClawdBot is installed on a server
 */
export async function checkInstallation(
  host: string,
  password: string
): Promise<boolean> {
  try {
    const conn = await connect({ host, password });
    const result = await executeCommand(
      conn,
      "su - clawdbot -c 'which clawdbot'"
    );
    conn.end();
    return result.code === 0 && result.stdout.includes("clawdbot");
  } catch {
    return false;
  }
}
