import { neon } from "@neondatabase/serverless";

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(process.env.DATABASE_URL);
}

// Types
export interface User {
  id: string;
  clerk_user_id: string;
  created_at: Date;
}

export interface Instance {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: "pending" | "provisioning" | "configuring" | "ready" | "error" | "terminated";
  error_message: string | null;
  provider: string | null;
  server_id: string | null;
  server_ip: string | null;
  tunnel_id: string | null;
  tunnel_url: string | null;
  terminal_url: string | null;
  moltbot_config: Record<string, unknown> | null;
  config_updated_at: Date | null;
  created_at: Date;
  provisioned_at: Date | null;
  ready_at: Date | null;
  terminated_at: Date | null;
  gateway_url: string | null;
  gateway_token: string | null;
  provisioning_status: { step: string; progress: number } | null;
}

// User operations
export async function getOrCreateUser(clerkUserId: string): Promise<User> {
  const sql = getDb();
  
  // Try to find existing user
  const existing = await sql`
    SELECT * FROM users WHERE clerk_user_id = ${clerkUserId}
  `;
  
  if (existing.length > 0) {
    return existing[0] as User;
  }
  
  // Create new user
  const created = await sql`
    INSERT INTO users (clerk_user_id)
    VALUES (${clerkUserId})
    RETURNING *
  `;
  
  return created[0] as User;
}

// Instance operations
export async function createInstance(
  userId: string,
  planId: string,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<Instance> {
  const sql = getDb();
  
  const created = await sql`
    INSERT INTO instances (user_id, plan_id, stripe_customer_id, stripe_subscription_id, status)
    VALUES (${userId}, ${planId}, ${stripeCustomerId ?? null}, ${stripeSubscriptionId ?? null}, 'pending')
    RETURNING *
  `;
  
  return created[0] as Instance;
}

export async function getInstanceByUserId(userId: string): Promise<Instance | null> {
  const sql = getDb();
  
  const instances = await sql`
    SELECT * FROM instances 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  
  return instances[0] as Instance | null ?? null;
}

export async function getInstanceById(instanceId: string): Promise<Instance | null> {
  const sql = getDb();
  
  const instances = await sql`
    SELECT * FROM instances WHERE id = ${instanceId}
  `;
  
  return instances[0] as Instance | null ?? null;
}

export async function updateInstanceStatus(
  instanceId: string,
  status: Instance["status"],
  errorMessage?: string
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE instances 
    SET status = ${status}, error_message = ${errorMessage ?? null}
    WHERE id = ${instanceId}
  `;
}

export async function updateInstanceConfig(
  instanceId: string,
  config: Record<string, unknown>
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE instances 
    SET moltbot_config = ${JSON.stringify(config)}, config_updated_at = NOW()
    WHERE id = ${instanceId}
  `;
}

export async function updateInstanceVps(
  instanceId: string,
  provider: string,
  serverId: string,
  serverIp: string,
  tunnelId?: string,
  tunnelUrl?: string,
  terminalUrl?: string
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE instances 
    SET 
      provider = ${provider},
      server_id = ${serverId},
      server_ip = ${serverIp}::inet,
      tunnel_id = ${tunnelId ?? null},
      tunnel_url = ${tunnelUrl ?? null},
      terminal_url = ${terminalUrl ?? null},
      provisioned_at = NOW()
    WHERE id = ${instanceId}
  `;
}

export async function markInstanceReady(instanceId: string): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE instances 
    SET status = 'ready', ready_at = NOW()
    WHERE id = ${instanceId}
  `;
}

// Onboarding: get or create draft instance for user
export async function getOrCreateDraftInstance(userId: string, planId: string = "free"): Promise<Instance> {
  const sql = getDb();
  
  // Check for existing active instance (any status except terminated)
  const existing = await sql`
    SELECT * FROM instances 
    WHERE user_id = ${userId} AND status != 'terminated'
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  
  if (existing.length > 0) {
    return existing[0] as Instance;
  }
  
  // Create new draft instance only if no active instance exists
  const created = await sql`
    INSERT INTO instances (user_id, plan_id, status, moltbot_config)
    VALUES (${userId}, ${planId}, 'pending', '{}')
    RETURNING *
  `;
  
  return created[0] as Instance;
}

// Onboarding: update anthropic key in config
export async function setAnthropicKey(instanceId: string, anthropicKey: string): Promise<void> {
  const sql = getDb();
  
  const authConfig = JSON.stringify({ auth: { anthropicKey } });
  
  await sql`
    UPDATE instances 
    SET moltbot_config = COALESCE(moltbot_config, '{}'::jsonb) || ${authConfig}::jsonb,
        config_updated_at = NOW()
    WHERE id = ${instanceId}
  `;
}

// Onboarding: update OpenAI key in config (optional)
export async function setOpenAIKey(instanceId: string, openaiKey: string | null): Promise<void> {
  const sql = getDb();
  
  if (openaiKey) {
    // Set the key using jsonb_set to preserve existing auth keys
    await sql`
      UPDATE instances 
      SET moltbot_config = jsonb_set(
        jsonb_set(
          COALESCE(moltbot_config, '{}'::jsonb),
          '{auth,openaiKey}',
          ${JSON.stringify(openaiKey)}::jsonb
        ),
        '{_openaiConfigured}',
        'true'::jsonb
      ),
      config_updated_at = NOW()
      WHERE id = ${instanceId}
    `;
  } else {
    // Just mark as configured (skipped)
    await sql`
      UPDATE instances 
      SET moltbot_config = jsonb_set(
        COALESCE(moltbot_config, '{}'::jsonb),
        '{_openaiConfigured}',
        'true'::jsonb
      ),
      config_updated_at = NOW()
      WHERE id = ${instanceId}
    `;
  }
}

// Onboarding: update Gemini key in config (optional)
export async function setGeminiKey(instanceId: string, geminiKey: string | null): Promise<void> {
  const sql = getDb();
  
  if (geminiKey) {
    // Set the key using jsonb_set to preserve existing auth keys
    await sql`
      UPDATE instances 
      SET moltbot_config = jsonb_set(
        jsonb_set(
          COALESCE(moltbot_config, '{}'::jsonb),
          '{auth,geminiKey}',
          ${JSON.stringify(geminiKey)}::jsonb
        ),
        '{_geminiConfigured}',
        'true'::jsonb
      ),
      config_updated_at = NOW()
      WHERE id = ${instanceId}
    `;
  } else {
    // Just mark as configured (skipped)
    await sql`
      UPDATE instances 
      SET moltbot_config = jsonb_set(
        COALESCE(moltbot_config, '{}'::jsonb),
        '{_geminiConfigured}',
        'true'::jsonb
      ),
      config_updated_at = NOW()
      WHERE id = ${instanceId}
    `;
  }
}

// Onboarding: update telegram bot config (token + bot username)
export async function setTelegramBotConfig(
  instanceId: string, 
  botToken: string, 
  botUsername: string
): Promise<void> {
  const sql = getDb();
  
  const telegramConfig = JSON.stringify({ 
    channels: { 
      telegram: { 
        botToken, 
        botUsername,
      } 
    } 
  });
  
  await sql`
    UPDATE instances 
    SET moltbot_config = COALESCE(moltbot_config, '{}'::jsonb) || ${telegramConfig}::jsonb,
        config_updated_at = NOW()
    WHERE id = ${instanceId}
  `;
}

// Onboarding: update telegram owner username
export async function setTelegramOwner(
  instanceId: string, 
  ownerUsername: string
): Promise<void> {
  const sql = getDb();
  
  // We need to merge into the existing telegram config
  await sql`
    UPDATE instances 
    SET moltbot_config = jsonb_set(
      COALESCE(moltbot_config, '{}'::jsonb),
      '{channels,telegram,ownerUsername}',
      ${JSON.stringify(ownerUsername)}::jsonb
    ),
    config_updated_at = NOW()
    WHERE id = ${instanceId}
  `;
}

// Get onboarding step based on config
export function getOnboardingStep(instance: Instance): "welcome" | "anthropic" | "openai" | "gemini" | "telegram" | "telegram-user" | "provisioning" | "complete" {
  const config = instance.moltbot_config as Record<string, unknown> | null;
  
  if (instance.status === "ready") {
    return "complete";
  }
  
  if (instance.status === "provisioning" || instance.status === "configuring") {
    return "provisioning";
  }
  
  if (!config) {
    return "welcome";
  }

  // Check if disclaimer was accepted
  if (!config.disclaimerAccepted) {
    return "welcome";
  }
  
  const auth = config.auth as Record<string, unknown> | undefined;
  const channels = config.channels as Record<string, unknown> | undefined;
  const telegram = channels?.telegram as Record<string, unknown> | undefined;
  
  if (!auth?.anthropicKey) {
    return "anthropic";
  }
  
  // OpenAI step (optional) - check if user has passed this step
  if (!config._openaiConfigured) {
    return "openai";
  }
  
  // Gemini step (optional) - check if user has passed this step
  if (!config._geminiConfigured) {
    return "gemini";
  }
  
  if (!telegram?.botToken) {
    return "telegram";
  }
  
  if (!telegram?.ownerUsername) {
    return "telegram-user";
  }
  
  return "provisioning";
}

// Accept disclaimer
export async function acceptDisclaimer(instanceId: string): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE instances 
    SET moltbot_config = COALESCE(moltbot_config, '{}'::jsonb) || '{"disclaimerAccepted": true}'::jsonb,
        config_updated_at = NOW()
    WHERE id = ${instanceId}
  `;
}

// Update provisioning progress (stored in dedicated column)
export async function updateProvisioningProgress(
  instanceId: string,
  step: string,
  progress: number
): Promise<void> {
  const sql = getDb();
  
  const provisioningStatus = JSON.stringify({ step, progress });
  
  await sql`
    UPDATE instances 
    SET provisioning_status = ${provisioningStatus}::jsonb
    WHERE id = ${instanceId}
  `;
}

// Get provisioning progress from dedicated column
export function getProvisioningProgress(instance: Instance): { step: string; progress: number } | null {
  return instance.provisioning_status;
}

// Store gateway credentials for remote RPC access (dedicated columns)
export async function setGatewayCredentials(
  instanceId: string,
  gatewayUrl: string,
  gatewayToken: string
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE instances 
    SET gateway_url = ${gatewayUrl},
        gateway_token = ${gatewayToken}
    WHERE id = ${instanceId}
  `;
}

// Get gateway credentials from dedicated columns
export function getGatewayCredentials(instance: Instance): { url: string; token: string } | null {
  if (!instance.gateway_url || !instance.gateway_token) {
    return null;
  }
  
  return {
    url: instance.gateway_url,
    token: instance.gateway_token,
  };
}
