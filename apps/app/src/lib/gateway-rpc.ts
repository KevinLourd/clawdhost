/**
 * Gateway RPC client for remote MoltBot configuration
 * Uses WebSocket to communicate with the MoltBot Gateway
 */

import WebSocket from "ws";

interface RpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface RpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Send an RPC request to the Gateway
 */
async function sendRpcRequest(
  gatewayUrl: string,
  gatewayToken: string,
  method: string,
  params?: Record<string, unknown>
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(gatewayUrl, {
      headers: {
        Authorization: `Bearer ${gatewayToken}`,
      },
      handshakeTimeout: 10000,
    });

    const requestId = Date.now();
    let responseReceived = false;

    const timeout = setTimeout(() => {
      if (!responseReceived) {
        ws.close();
        reject(new Error("RPC request timed out"));
      }
    }, 30000);

    ws.on("open", () => {
      const request: RpcRequest = {
        jsonrpc: "2.0",
        id: requestId,
        method,
        params,
      };
      ws.send(JSON.stringify(request));
    });

    ws.on("message", (data: Buffer) => {
      try {
        const response: RpcResponse = JSON.parse(data.toString());
        if (response.id === requestId) {
          responseReceived = true;
          clearTimeout(timeout);
          ws.close();

          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        }
      } catch (error) {
        // Ignore non-JSON messages
      }
    });

    ws.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    ws.on("close", () => {
      clearTimeout(timeout);
      if (!responseReceived) {
        reject(new Error("WebSocket closed before response"));
      }
    });
  });
}

/**
 * Patch the MoltBot configuration via Gateway RPC
 */
export async function patchConfig(
  gatewayUrl: string,
  gatewayToken: string,
  config: Record<string, unknown>
): Promise<void> {
  await sendRpcRequest(gatewayUrl, gatewayToken, "config.patch", { config });
}

/**
 * Apply the configuration (restart services as needed)
 */
export async function applyConfig(
  gatewayUrl: string,
  gatewayToken: string
): Promise<void> {
  await sendRpcRequest(gatewayUrl, gatewayToken, "config.apply", {});
}

/**
 * Set environment variables via Gateway RPC
 */
export async function setEnvVars(
  gatewayUrl: string,
  gatewayToken: string,
  envVars: Record<string, string>
): Promise<void> {
  await sendRpcRequest(gatewayUrl, gatewayToken, "env.set", { vars: envVars });
}

/**
 * Get current configuration
 */
export async function getConfig(
  gatewayUrl: string,
  gatewayToken: string
): Promise<Record<string, unknown>> {
  const result = await sendRpcRequest(gatewayUrl, gatewayToken, "config.get", {});
  return result as Record<string, unknown>;
}
