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
 * Wait for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send an RPC request to the Gateway (single attempt)
 */
async function sendRpcRequestOnce(
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
      } catch {
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
 * Send an RPC request to the Gateway with retry logic
 * Gateway may take up to 30s to be ready after server provisioning
 */
async function sendRpcRequest(
  gatewayUrl: string,
  gatewayToken: string,
  method: string,
  params?: Record<string, unknown>
): Promise<unknown> {
  const maxRetries = 6;
  const retryDelays = [5000, 5000, 10000, 10000, 15000, 15000]; // Total: 60s of waiting
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await sendRpcRequestOnce(gatewayUrl, gatewayToken, method, params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if it's a retryable error (connection errors, 502, etc.)
      const errorMsg = lastError.message.toLowerCase();
      const isRetryable = 
        errorMsg.includes("502") ||
        errorMsg.includes("503") ||
        errorMsg.includes("connection") ||
        errorMsg.includes("econnrefused") ||
        errorMsg.includes("timeout") ||
        errorMsg.includes("closed before");
      
      if (!isRetryable || attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = retryDelays[attempt] || 10000;
      console.log(`[Gateway RPC] Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error("RPC request failed");
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
