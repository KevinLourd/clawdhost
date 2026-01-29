import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  createInstance, 
  updateInstanceStatus,
  updateInstanceConfig,
  getInstanceById 
} from "@/lib/db";

// In-memory store for provisioning status (use Redis in production)
const provisioningStatus = new Map<string, {
  status: "pending" | "provisioning" | "configuring" | "ready" | "error";
  currentStep: string;
  message?: string;
  instanceId: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { anthropicKey, telegramBotToken, planId = "linux" } = await request.json();

    if (!anthropicKey || !telegramBotToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get or create user in DB
    const user = await getOrCreateUser(clerkUserId);

    // Create instance in DB
    const instance = await createInstance(user.id, planId);

    // Save MoltBot config
    const moltbotConfig = {
      agents: {
        defaults: {
          workspace: "~/clawd",
          model: "claude-sonnet-4-20250514",
        },
      },
      channels: {
        telegram: {
          botToken: telegramBotToken,
          dmPolicy: "allowlist",
        },
      },
      auth: {
        anthropicKey,
      },
    };

    await updateInstanceConfig(instance.id, moltbotConfig);

    // Initialize provisioning status
    provisioningStatus.set(instance.id, {
      status: "pending",
      currentStep: "create",
      instanceId: instance.id,
    });

    // Start provisioning in background
    startProvisioning(instance.id, clerkUserId, planId, moltbotConfig);

    return NextResponse.json({ 
      provisioningId: instance.id,
      status: "pending" 
    }, { status: 202 });
  } catch (error) {
    console.error("Provision error:", error);
    return NextResponse.json(
      { error: "Failed to start provisioning" },
      { status: 500 }
    );
  }
}

async function startProvisioning(
  instanceId: string,
  clerkUserId: string,
  planId: string,
  moltbotConfig: Record<string, unknown>
) {
  const updateStatus = async (
    status: "pending" | "provisioning" | "configuring" | "ready" | "error",
    currentStep: string,
    message?: string
  ) => {
    provisioningStatus.set(instanceId, { status, currentStep, instanceId, message });
    await updateInstanceStatus(instanceId, status, message);
  };

  try {
    // Step 1: Call worker to create server
    await updateStatus("provisioning", "create");

    const workerUrl = process.env.WORKER_URL;
    const workerSecret = process.env.WORKER_SECRET;

    if (!workerUrl || !workerSecret) {
      throw new Error("Worker not configured");
    }

    // Get user email from Clerk for the worker
    const { clerkClient } = await import("@clerk/nextjs/server");
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(clerkUserId);
    const customerEmail = user.emailAddresses[0]?.emailAddress;

    if (!customerEmail) {
      throw new Error("User email not found");
    }

    // Call worker API
    const response = await fetch(`${workerUrl}/provision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${workerSecret}`,
      },
      body: JSON.stringify({
        planId,
        customerEmail,
        customerName: user.fullName || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Worker failed to start provisioning");
    }

    // Worker responds immediately, provisioning happens in background
    // We simulate status updates here - in production, use webhooks from worker
    await updateStatus("provisioning", "configure");
    
    // Poll or wait for completion (simplified - use webhooks in production)
    await updateStatus("configuring", "install");
    
    // Mark as ready after worker completes (simplified)
    await updateStatus("ready", "complete");

  } catch (error) {
    console.error("Provisioning error:", error);
    await updateInstanceStatus(
      instanceId, 
      "error", 
      error instanceof Error ? error.message : "Unknown error"
    );
    provisioningStatus.set(instanceId, {
      status: "error",
      currentStep: "error",
      message: error instanceof Error ? error.message : "Provisioning failed",
      instanceId,
    });
  }
}

export { provisioningStatus };
