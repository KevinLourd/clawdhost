import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  updateInstanceStatus,
} from "@/lib/db";
import { patchConfig } from "@/lib/gateway-rpc";

interface MoltBotAuth {
  anthropicKey?: string;
  openaiKey?: string;
  geminiKey?: string;
}

interface TelegramConfig {
  botToken?: string;
  botUsername?: string;
  ownerUsername?: string;
}

/**
 * POST /api/provision/configure
 * Patches the MoltBot configuration via Gateway RPC
 * Called when the server is ready and user has finished onboarding
 */
export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    // Check if instance is ready for configuration
    if (instance.status !== "ready") {
      return NextResponse.json(
        { error: "Instance not ready for configuration", status: instance.status },
        { status: 400 }
      );
    }

    // Check if we have gateway credentials
    if (!instance.gateway_url || !instance.gateway_token) {
      return NextResponse.json(
        { error: "Gateway credentials not available" },
        { status: 400 }
      );
    }

    // Get the config from moltbot_config
    const config = instance.moltbot_config as Record<string, unknown> | null;
    if (!config) {
      return NextResponse.json(
        { error: "No configuration to apply" },
        { status: 400 }
      );
    }

    const authConfig = config.auth as MoltBotAuth | undefined;
    const channels = config.channels as { telegram?: TelegramConfig } | undefined;
    const telegram = channels?.telegram;

    console.log(`[Configure] Patching config for instance ${instance.id}`);
    console.log(`[Configure] Gateway URL: ${instance.gateway_url}`);

    // Update status to configuring
    await updateInstanceStatus(instance.id, "configuring");

    try {
      // Build the config patch with env vars and channels
      // API keys go in the 'env' block per MoltBot docs
      const configPatch: Record<string, unknown> = {};

      // Add API keys to env block
      const envVars: Record<string, string> = {};
      if (authConfig?.anthropicKey) {
        envVars.ANTHROPIC_API_KEY = authConfig.anthropicKey;
      }
      if (authConfig?.openaiKey) {
        envVars.OPENAI_API_KEY = authConfig.openaiKey;
      }
      if (authConfig?.geminiKey) {
        envVars.GEMINI_API_KEY = authConfig.geminiKey;
      }

      if (Object.keys(envVars).length > 0) {
        configPatch.env = envVars;
        console.log(`[Configure] Adding ${Object.keys(envVars).length} API keys to config`);
      }

      // Add Telegram channel config
      if (telegram?.botToken) {
        const ownerUsername = telegram.ownerUsername;
        configPatch.channels = {
          telegram: {
            botToken: telegram.botToken,
            enabled: true,
            dmPolicy: ownerUsername ? "allowlist" : "pairing",
            ...(ownerUsername && { allowFrom: [ownerUsername] }),
          },
        };
        console.log(`[Configure] Adding Telegram channel to config`);
      }

      // Patch config (includes env vars + channels, triggers restart)
      console.log(`[Configure] Patching configuration`);
      await patchConfig(instance.gateway_url, instance.gateway_token, configPatch);

      // Mark as ready (configuration complete)
      await updateInstanceStatus(instance.id, "ready");

      console.log(`[Configure] Configuration complete for instance ${instance.id}`);

      // Step 4: Send ready email (was skipped during early provisioning)
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(clerkUserId);
        const customerEmail = clerkUser.emailAddresses[0]?.emailAddress;
        const customerName = clerkUser.fullName || clerkUser.firstName || undefined;

        if (customerEmail) {
          // Call worker to send email
          const workerUrl = process.env.WORKER_URL;
          const workerSecret = process.env.WORKER_SECRET;
          
          if (workerUrl && workerSecret) {
            await fetch(`${workerUrl}/email/ready`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${workerSecret}`,
              },
              body: JSON.stringify({
                to: customerEmail,
                customerName,
              }),
            });
            console.log(`[Configure] Ready email sent to ${customerEmail}`);
          }
        }
      } catch (emailError) {
        console.error("[Configure] Failed to send ready email:", emailError);
        // Don't fail the response if email fails
      }

      return NextResponse.json({ success: true });
    } catch (rpcError) {
      console.error("[Configure] RPC error:", rpcError);
      // Don't mark as error - the server is still running, just config failed
      // User can retry
      return NextResponse.json(
        { error: `Configuration failed: ${rpcError instanceof Error ? rpcError.message : "Unknown error"}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Configure error:", error);
    return NextResponse.json(
      { error: "Failed to configure instance" },
      { status: 500 }
    );
  }
}
