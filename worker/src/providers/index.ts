/**
 * Provider interface for server provisioning
 * Supports multiple cloud providers (Hetzner, Scaleway, etc.)
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
  switch (planId) {
    case "linux":
      return "hetzner";
    case "macos-m1":
    case "macos-m4":
      return "scaleway";
    default:
      throw new Error(`Unknown plan: ${planId}`);
  }
}
