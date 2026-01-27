/**
 * Provisioning route handler
 */

import { Router, Request, Response } from "express";
import { getProviderForPlan } from "../providers";
import { hetznerProvider } from "../providers/hetzner";
import { scalewayProvider } from "../providers/scaleway";
import { installClawdBot } from "../services/installer";
import { sendCredentialsEmail, sendProvisioningErrorEmail } from "../services/email";
import { createTunnel, deleteTunnel } from "../services/cloudflare";
import { saveInstanceToSubscription } from "../services/stripe";
import {
  trackProvisioningStarted,
  trackServerCreated,
  trackInstallationComplete,
  trackProvisioningComplete,
  trackProvisioningFailed,
} from "../services/analytics";
import crypto from "crypto";

const router = Router();

/**
 * Generate a secure random password
 */
function generateSecurePassword(length: number = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

// Simple auth middleware using a shared secret
const authMiddleware = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.WORKER_SECRET;

  if (!expectedToken) {
    console.error("[Auth] WORKER_SECRET not configured");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

interface ProvisionRequest {
  planId: string;
  customerEmail: string;
  customerName?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

/**
 * POST /provision
 * Starts the provisioning process for a new instance
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const body = req.body as ProvisionRequest;

  if (!body.planId || !body.customerEmail) {
    return res.status(400).json({ error: "Missing planId or customerEmail" });
  }

  console.log(`[Provision] Starting for ${body.customerEmail}, plan: ${body.planId}`);

  // Respond immediately, process in background
  res.status(202).json({ 
    status: "provisioning",
    message: "Provisioning started" 
  });

  // Process in background
  processProvisioning(body).catch((error) => {
    console.error("[Provision] Unhandled error:", error);
  });
});

async function processProvisioning(request: ProvisionRequest) {
  const { planId, customerEmail, customerName } = request;
  const startTime = Date.now();
  let serverId: string | undefined;
  let tunnelId: string | undefined;

  // Track start
  trackProvisioningStarted({ planId, customerEmail });

  try {
    // Get the appropriate provider
    const providerType = getProviderForPlan(planId);
    const provider = providerType === "hetzner" ? hetznerProvider : scalewayProvider;

    console.log(`[Provision] Using provider: ${provider.name}`);

    // Generate server name ONCE to use for both tunnel and server
    const timestamp = Date.now();
    const serverName = `${planId}-${timestamp}`;
    
    // Generate random password for terminal auth
    const terminalPassword = generateSecurePassword(16);
    const terminalUsername = "clawdbot";

    // Step 1: Create Cloudflare tunnel (if configured)
    let tunnelToken: string | undefined;
    let tunnelHostname: string | undefined;
    
    const hasCloudflareConfig = process.env.CLOUDFLARE_API_TOKEN && 
                                 process.env.CLOUDFLARE_ACCOUNT_ID && 
                                 process.env.CLOUDFLARE_ZONE_ID;

    if (hasCloudflareConfig) {
      console.log(`[Provision] Creating Cloudflare tunnel for ${serverName}...`);
      
      const tunnel = await createTunnel(serverName);
      tunnelId = tunnel.tunnelId;
      tunnelToken = tunnel.tunnelToken;
      tunnelHostname = tunnel.hostname;
      
      console.log(`[Provision] Tunnel created: ${tunnelHostname}`);
      console.log(`[Provision] Tunnel token received: ${tunnelToken ? 'yes' : 'no'}`);
    } else {
      console.log(`[Provision] Cloudflare not configured, using direct IP access`);
    }

    // Step 2: Create server with tunnel token and terminal password
    const server = await provider.createServer({
      name: `clawdhost-${serverName}`,
      planId,
      customerEmail,
      customerName,
      tunnelToken,
      tunnelHostname,
      terminalPassword,
    });

    serverId = server.id;
    console.log(`[Provision] Server created: ${server.id} at ${server.ip}`);

    // Track server created
    trackServerCreated({
      planId,
      customerEmail,
      serverId: server.id,
      serverIp: server.ip,
    });

    // Step 3: Wait for server to be ready
    const readyServer = await provider.waitForReady(server);

    console.log(`[Provision] Server ready: ${readyServer.ip}`);

    // Step 4: Wait for ClawdBot installation to complete
    const installResult = await installClawdBot(readyServer, customerEmail, customerName);

    if (!installResult.success) {
      throw new Error(`Installation failed: ${installResult.error}`);
    }

    // Use Cloudflare tunnel URL if available, otherwise fall back to IP
    const terminalUrl = tunnelHostname 
      ? `https://${tunnelHostname}`
      : `http://${readyServer.ip}:7681`;

    console.log(`[Provision] ClawdBot installed on ${readyServer.ip}`);
    console.log(`[Provision] Terminal URL: ${terminalUrl}`);

    // Track installation complete
    trackInstallationComplete({
      planId,
      customerEmail,
      serverId: readyServer.id,
      tunnelUrl: terminalUrl,
      durationMs: Date.now() - startTime,
    });

    // Step 5: Send credentials email with terminal link
    const planNames: Record<string, string> = {
      linux: "Essential",
      "macos-m1": "Apple",
      "macos-m4": "Pro",
    };

    await sendCredentialsEmail({
      to: customerEmail,
      customerName,
      terminalUrl: terminalUrl,
      planName: planNames[planId] || planId,
      terminalUsername,
      terminalPassword,
    });

    console.log(`[Provision] Complete for ${customerEmail}`);

    // Track complete
    trackProvisioningComplete({
      planId,
      customerEmail,
      serverId: readyServer.id,
      tunnelUrl: terminalUrl,
      durationMs: Date.now() - startTime,
    });

    // Save instance info to Stripe subscription metadata
    if (request.stripeSubscriptionId) {
      try {
        await saveInstanceToSubscription(request.stripeSubscriptionId, {
          serverId: readyServer.id,
          tunnelId: tunnelId,
          serverIp: readyServer.ip,
          provider: provider.name,
          terminalUrl: terminalUrl,
          provisionedAt: new Date().toISOString(),
        });
        console.log(`[Provision] Saved instance metadata to Stripe subscription`);
      } catch (error) {
        console.error(`[Provision] Failed to save metadata to Stripe:`, error);
        // Don't fail provisioning if metadata save fails
      }
    }
  } catch (error) {
    console.error(`[Provision] Failed for ${customerEmail}:`, error);

    // Cleanup tunnel if it was created
    if (tunnelId) {
      try {
        await deleteTunnel(tunnelId);
        console.log(`[Provision] Cleaned up tunnel ${tunnelId}`);
      } catch (cleanupError) {
        console.error("[Provision] Failed to cleanup tunnel:", cleanupError);
      }
    }

    // Track failure
    trackProvisioningFailed({
      planId,
      customerEmail,
      serverId,
      error: error instanceof Error ? error.message : "Unknown error",
      durationMs: Date.now() - startTime,
    });

    // Send error notification
    try {
      await sendProvisioningErrorEmail(
        customerEmail,
        customerName,
        error instanceof Error ? error.message : "Unknown error"
      );
    } catch (emailError) {
      console.error("[Provision] Failed to send error email:", emailError);
    }
  }
}

/**
 * GET /provision/health
 * Health check endpoint
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "clawdhost-worker" });
});

export default router;
