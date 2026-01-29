/**
 * Deprovisioning route handler
 * Handles subscription cancellation - deletes server and tunnel
 */

import { Router, Request, Response } from "express";
import { hetznerProvider } from "../providers/hetzner";
import { deleteTunnel } from "../services/cloudflare";

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

interface DeprovisionRequest {
  serverId: string;
  tunnelId?: string;
  provider: string;
  customerEmail: string;
  reason?: string;
}

/**
 * POST /deprovision
 * Deletes a server and associated tunnel
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const body = req.body as DeprovisionRequest;

  if (!body.serverId || !body.provider) {
    return res.status(400).json({ error: "Missing serverId or provider" });
  }

  console.log(`[Deprovision] Starting for server ${body.serverId} (${body.provider})`);
  console.log(`[Deprovision] Customer: ${body.customerEmail}, Reason: ${body.reason || "subscription_cancelled"}`);

  try {
    // Delete the server
    if (body.provider === "hetzner") {
      await hetznerProvider.deleteServer(body.serverId);
      console.log(`[Deprovision] Hetzner server ${body.serverId} deleted`);
    } else {
      console.log(`[Deprovision] Provider ${body.provider} not implemented yet`);
    }

    // Delete the Cloudflare tunnel if it exists
    if (body.tunnelId) {
      try {
        await deleteTunnel(body.tunnelId);
        console.log(`[Deprovision] Cloudflare tunnel ${body.tunnelId} deleted`);
      } catch (error) {
        console.error(`[Deprovision] Failed to delete tunnel:`, error);
        // Don't fail if tunnel deletion fails
      }
    }

    console.log(`[Deprovision] Complete for ${body.customerEmail}`);

    return res.json({
      status: "deprovisioned",
      serverId: body.serverId,
      tunnelId: body.tunnelId,
    });
  } catch (error) {
    console.error(`[Deprovision] Failed:`, error);
    return res.status(500).json({
      error: "Deprovisioning failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
