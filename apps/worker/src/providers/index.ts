/**
 * Provider interface for server provisioning
 * Supports multiple cloud providers (Hetzner, Scaleway, etc.)
 * Last updated: 2026-01-29 - Added free/pro/apple plans
 */

export interface ServerInfo {
  id: string;
  name: string;
  ip: string;
  status: "creating" | "running" | "stopped" | "error";
  provider: "hetzner" | "scaleway";
  credentials: {
    username: string;
    password?: string;
    privateKey?: string;
  };
}

export interface ProvisionOptions {
  name: string;
  planId: string;
  customerEmail: string;
  customerName?: string;
  tunnelToken?: string;
  tunnelHostname?: string;
  terminalPassword?: string;
}

export interface Provider {
  name: string;
  
  /**
   * Create a new server
   */
  createServer(options: ProvisionOptions): Promise<ServerInfo>;
  
  /**
   * Wait for server to be ready for SSH
   */
  waitForReady(server: ServerInfo): Promise<ServerInfo>;
  
  /**
   * Delete a server
   */
  deleteServer(serverId: string): Promise<void>;
  
  /**
   * Get server status
   */
  getServer(serverId: string): Promise<ServerInfo | null>;
}

/**
 * Get the appropriate provider for a plan
 */
export function getProviderForPlan(planId: string): "hetzner" | "scaleway" {
  console.log(`[Provider] getProviderForPlan called with: "${planId}" (type: ${typeof planId})`);
  
  // Normalize the planId
  const normalizedPlanId = planId?.trim()?.toLowerCase();
  console.log(`[Provider] Normalized planId: "${normalizedPlanId}"`);
  
  switch (normalizedPlanId) {
    case "free":
    case "pro":
    case "linux":
      console.log(`[Provider] Matched Linux plan, using Hetzner`);
      return "hetzner";
    case "apple":
    case "macos-m1":
    case "macos-m4":
      console.log(`[Provider] Matched Apple plan, using Scaleway`);
      return "scaleway";
    default:
      console.error(`[Provider] Unknown plan: "${planId}" (normalized: "${normalizedPlanId}")`);
      throw new Error(`Unknown plan: ${planId}`);
  }
}
