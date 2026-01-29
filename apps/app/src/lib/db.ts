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
