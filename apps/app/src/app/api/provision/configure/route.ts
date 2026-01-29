import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  updateInstanceStatus,
} from "@/lib/db";
import { patchConfig, setEnvVars, applyConfig } from "@/lib/gateway-rpc";

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
      // Step 1: Set environment variables
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
        console.log(`[Configure] Setting ${Object.keys(envVars).length} environment variables`);
        await setEnvVars(instance.gateway_url, instance.gateway_token, envVars);
      }

      // Step 2: Patch config with Telegram channel
      if (telegram?.botToken) {
        const ownerUsername = telegram.ownerUsername;
        const channelConfig = {
          channels: {
            telegram: {
              botToken: telegram.botToken,
              enabled: true,
              dmPolicy: ownerUsername ? "allowlist" : "pairing",
              ...(ownerUsername && { allowFrom: [ownerUsername] }),
            },
          },
        };
        console.log(`[Configure] Patching Telegram config`);
        await patchConfig(instance.gateway_url, instance.gateway_token, channelConfig);
      }

      // Step 3: Apply configuration
      console.log(`[Configure] Applying configuration`);
      await applyConfig(instance.gateway_url, instance.gateway_token);

      // Mark as ready (configuration complete)
      await updateInstanceStatus(instance.id, "ready");

      console.log(`[Configure] Configuration complete for instance ${instance.id}`);

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
