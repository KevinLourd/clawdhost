/**
 * Clawd Host Worker - Provisioning Service
 * 
 * This service handles long-running provisioning tasks:
 * - Creating VPS instances (Hetzner for Linux, Scaleway for macOS)
 * - Installing ClawdBot via SSH
 * - Sending credentials to customers
 */

import express from "express";
import provisionRouter from "./routes/provision";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/provision", provisionRouter);

// Root health check
app.get("/", (_req, res) => {
  res.json({
    service: "clawdhost-worker",
    version: "1.0.0",
    status: "running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🦞 Clawd Host Worker                            ║
║   Provisioning Service                            ║
║                                                   ║
║   Running on port ${PORT}                            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);

  // Check required env vars
  const required = ["HETZNER_API_TOKEN", "RESEND_API_KEY", "WORKER_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(", ")}`);
  }
});
