import { neon } from "@neondatabase/serverless";

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(process.env.DATABASE_URL);
}

export interface User {
  id: string;
  clerk_user_id: string;
  created_at: Date;
}

export interface Instance {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  error_message: string | null;
  provider: string | null;
  server_id: string | null;
  server_ip: string | null;
  tunnel_id: string | null;
  tunnel_url: string | null;
  terminal_url: string | null;
  moltbot_config: Record<string, unknown> | null;
  created_at: Date;
  provisioned_at: Date | null;
  ready_at: Date | null;
  terminated_at: Date | null;
}

export async function getAllUsers(): Promise<User[]> {
  const sql = getDb();
  const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
  return users as User[];
}

export async function getAllInstances(): Promise<(Instance & { clerk_user_id: string })[]> {
  const sql = getDb();
  const instances = await sql`
    SELECT i.*, u.clerk_user_id 
    FROM instances i 
    LEFT JOIN users u ON i.user_id = u.id 
    ORDER BY i.created_at DESC
  `;
  return instances as (Instance & { clerk_user_id: string })[];
}

export async function getUserWithInstances(userId: string): Promise<{ user: User; instances: Instance[] } | null> {
  const sql = getDb();
  
  const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
  if (users.length === 0) return null;
  
  const instances = await sql`SELECT * FROM instances WHERE user_id = ${userId} ORDER BY created_at DESC`;
  
  return {
    user: users[0] as User,
    instances: instances as Instance[],
  };
}

export async function deleteUserAndInstances(userId: string): Promise<{ instanceIds: string[] }> {
  const sql = getDb();
  
  // Get instances first for Hetzner cleanup
  const instances = await sql`SELECT id, server_id, provider FROM instances WHERE user_id = ${userId}`;
  
  // Delete instances
  await sql`DELETE FROM instances WHERE user_id = ${userId}`;
  
  // Delete user
  await sql`DELETE FROM users WHERE id = ${userId}`;
  
  return {
    instanceIds: instances.map((i) => i.id as string),
  };
}

export async function getInstanceById(instanceId: string): Promise<(Instance & { clerk_user_id: string }) | null> {
  const sql = getDb();
  const instances = await sql`
    SELECT i.*, u.clerk_user_id 
    FROM instances i 
    LEFT JOIN users u ON i.user_id = u.id 
    WHERE i.id = ${instanceId}
  `;
  return instances[0] as (Instance & { clerk_user_id: string }) | null;
}

export async function deleteInstance(instanceId: string): Promise<Instance | null> {
  const sql = getDb();
  const instances = await sql`DELETE FROM instances WHERE id = ${instanceId} RETURNING *`;
  return instances[0] as Instance | null;
}

// Stats
export async function getStats(): Promise<{ users: number; instances: number; ready: number; error: number }> {
  const sql = getDb();
  
  const [usersResult, instancesResult, readyResult, errorResult] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM users`,
    sql`SELECT COUNT(*) as count FROM instances`,
    sql`SELECT COUNT(*) as count FROM instances WHERE status = 'ready'`,
    sql`SELECT COUNT(*) as count FROM instances WHERE status = 'error'`,
  ]);
  
  return {
    users: Number(usersResult[0].count),
    instances: Number(instancesResult[0].count),
    ready: Number(readyResult[0].count),
    error: Number(errorResult[0].count),
  };
}
