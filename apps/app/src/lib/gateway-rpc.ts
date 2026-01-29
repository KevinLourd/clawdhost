/**
 * Gateway RPC client for remote MoltBot configuration
 * Uses WebSocket to communicate with the MoltBot Gateway
 * 
 * Protocol: https://docs.clawd.bot/gateway/protocol
 * 1. Gateway sends connect.challenge with nonce
 * 2. Client responds with connect request (auth, device info)
 * 3. Gateway responds with hello-ok
 * 4. Client can now send RPC requests
 */

import WebSocket from "ws";
import crypto from "crypto";

// MoltBot protocol message types
interface ProtocolRequest {
  type: "req";
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

interface ProtocolResponse {
  type: "res";
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

interface ProtocolEvent {
  type: "event";
  event: string;
  payload?: Record<string, unknown>;
}

type ProtocolMessage = ProtocolRequest | ProtocolResponse | ProtocolEvent;

/**
 * Wait for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

/**
 * Send an RPC request to the Gateway (single attempt)
 * Implements the MoltBot gateway protocol handshake
 */
async function sendRpcRequestOnce(
  gatewayUrl: string,
  gatewayToken: string,
  method: string,
  params?: Record<string, unknown>
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(gatewayUrl, {
      handshakeTimeout: 10000,
    });

    let handshakeComplete = false;
    let responseReceived = false;
    const rpcRequestId = generateRequestId();

    const timeout = setTimeout(() => {
      if (!responseReceived) {
        ws.close();
        reject(new Error("RPC request timed out"));
      }
    }, 30000);

    ws.on("open", () => {
      // WebSocket is open, wait for connect.challenge from gateway
      console.log("[Gateway RPC] WebSocket connected, waiting for challenge...");
    });

    ws.on("message", (data: Buffer) => {
      try {
        const message: ProtocolMessage = JSON.parse(data.toString());

        // Handle connect.challenge event
        if (message.type === "event" && message.event === "connect.challenge") {
          console.log("[Gateway RPC] Received connect.challenge, sending connect request...");
          
          // Send connect request with authentication
          // Valid client.id: gateway-client, cli, webchat, etc.
          // Valid client.mode: backend, cli, ui, node, etc.
          const connectRequest: ProtocolRequest = {
            type: "req",
            id: generateRequestId(),
            method: "connect",
            params: {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: "gateway-client",
                version: "1.0.0",
                platform: "linux",
                mode: "backend",
              },
              role: "operator",
              scopes: ["operator.read", "operator.write", "operator.admin"],
              caps: [],
              commands: [],
              permissions: {},
              auth: {
                token: gatewayToken,
              },
              locale: "en-US",
              userAgent: "clawdhost/1.0.0",
            },
          };
          ws.send(JSON.stringify(connectRequest));
          return;
        }

        // Handle connect response (hello-ok)
        if (message.type === "res" && !handshakeComplete) {
          if (message.ok) {
            console.log("[Gateway RPC] Handshake complete, sending RPC request...");
            handshakeComplete = true;
            
            // Now send the actual RPC request
            const rpcRequest: ProtocolRequest = {
              type: "req",
              id: rpcRequestId,
              method,
              params,
            };
            ws.send(JSON.stringify(rpcRequest));
          } else {
            clearTimeout(timeout);
            ws.close();
            reject(new Error(`Handshake failed: ${message.error?.message || "Unknown error"}`));
          }
          return;
        }

        // Handle RPC response
        if (message.type === "res" && message.id === rpcRequestId) {
          responseReceived = true;
          clearTimeout(timeout);
          ws.close();

          if (message.ok) {
            resolve(message.payload);
          } else {
            reject(new Error(message.error?.message || "RPC request failed"));
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
