/**
 * Email route handler
 */

import { Router, Request, Response } from "express";
import { sendMoltBotReadyEmail } from "../services/email";

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

interface ReadyEmailRequest {
  to: string;
  customerName?: string;
}

/**
 * POST /email/ready
 * Sends the MoltBot ready email
 */
router.post("/ready", authMiddleware, async (req: Request, res: Response) => {
  const body = req.body as ReadyEmailRequest;

  if (!body.to) {
    return res.status(400).json({ error: "Missing 'to' email address" });
  }

  try {
    await sendMoltBotReadyEmail({
      to: body.to,
      customerName: body.customerName,
    });

    console.log(`[Email] Ready email sent to ${body.to}`);
    res.json({ success: true });
  } catch (error) {
    console.error("[Email] Failed to send ready email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
