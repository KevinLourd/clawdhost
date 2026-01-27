/**
 * Scaleway provider for macOS VPS provisioning
 * TODO: Implement when ready for macOS plans
 */

import { Provider, ServerInfo, ProvisionOptions } from "./index";

export class ScalewayProvider implements Provider {
  name = "scaleway";

  async createServer(_options: ProvisionOptions): Promise<ServerInfo> {
    // TODO: Implement Scaleway Apple Silicon provisioning
    // API Docs: https://www.scaleway.com/en/developers/api/apple-silicon/
    throw new Error("Scaleway macOS provisioning not yet implemented");
  }

  async waitForReady(_server: ServerInfo): Promise<ServerInfo> {
    throw new Error("Scaleway macOS provisioning not yet implemented");
  }

  async deleteServer(_serverId: string): Promise<void> {
    throw new Error("Scaleway macOS provisioning not yet implemented");
  }

  async getServer(_serverId: string): Promise<ServerInfo | null> {
    throw new Error("Scaleway macOS provisioning not yet implemented");
  }
}

export const scalewayProvider = new ScalewayProvider();
