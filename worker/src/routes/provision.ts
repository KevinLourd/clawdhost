/**
 * Provisioning route handler
 */

import { Router, Request, Response } from "express";
import { getProviderForPlan } from "../providers";
import { hetznerProvider } from "../providers/hetzner";
import { scalewayProvider } from "../providers/scaleway";
import { installClawdBot } from "../services/installer";
import { sendCredentialsEmail, sendProvisioningErrorEmail } from "../services/email";
import {
  trackProvisioningStarted,
  trackServerCreated,
  trackInstallationComplete,
  trackProvisioningComplete,
  trackProvisioningFailed,
} from "../services/analytics";

const router = Router();

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

  // Track start
  trackProvisioningStarted({ planId, customerEmail });

  try {
    // Get the appropriate provider
    const providerType = getProviderForPlan(planId);
    const provider = providerType === "hetzner" ? hetznerProvider : scalewayProvider;

    console.log(`[Provision] Using provider: ${provider.name}`);

    // Step 1: Create server
    const server = await provider.createServer({
      name: `clawdhost-${planId}-${Date.now()}`,
      planId,
      customerEmail,
      customerName,
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

    // Step 2: Wait for server to be ready
    const readyServer = await provider.waitForReady(server);

    console.log(`[Provision] Server ready: ${readyServer.ip}`);

    // Step 3: Install ClawdBot + ttyd + Cloudflare Tunnel
    const installResult = await installClawdBot(readyServer, customerEmail, customerName);

    if (!installResult.success) {
      throw new Error(`Installation failed: ${installResult.error}`);
    }

    if (!installResult.tunnelUrl) {
      throw new Error("Installation succeeded but no tunnel URL was generated");
    }

    console.log(`[Provision] ClawdBot installed on ${readyServer.ip}`);
    console.log(`[Provision] Terminal URL: ${installResult.tunnelUrl}`);

    // Track installation complete
    trackInstallationComplete({
      planId,
      customerEmail,
      serverId: readyServer.id,
      tunnelUrl: installResult.tunnelUrl,
      durationMs: Date.now() - startTime,
    });

    // Step 4: Send credentials email with terminal link
    const planNames: Record<string, string> = {
      linux: "Linux",
      "macos-m1": "macOS M1",
      "macos-m4": "macOS M4",
    };

    await sendCredentialsEmail({
      to: customerEmail,
      customerName,
      terminalUrl: installResult.tunnelUrl,
      planName: planNames[planId] || planId,
    });

    console.log(`[Provision] Complete for ${customerEmail}`);

    // Track complete
    trackProvisioningComplete({
      planId,
      customerEmail,
      serverId: readyServer.id,
      tunnelUrl: installResult.tunnelUrl,
      durationMs: Date.now() - startTime,
    });

    // TODO: Save instance info to database for tracking
  } catch (error) {
    console.error(`[Provision] Failed for ${customerEmail}:`, error);

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
