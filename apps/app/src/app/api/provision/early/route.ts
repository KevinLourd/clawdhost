import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  updateInstanceStatus,
} from "@/lib/db";

/**
 * Start early provisioning (without full config)
 * This spins up the server while the user fills in the rest of the onboarding
 */
export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    // Check if already provisioning or ready
    if (instance.status === "provisioning" || instance.status === "configuring" || instance.status === "ready") {
      return NextResponse.json({ 
        instanceId: instance.id,
        status: instance.status,
        message: "Provisioning already in progress or complete"
      });
    }

    // Start early provisioning in background (without config)
    await updateInstanceStatus(instance.id, "provisioning");
    startEarlyProvisioning(instance.id, clerkUserId, instance.plan_id);

    return NextResponse.json({ 
      instanceId: instance.id,
      status: "provisioning" 
    }, { status: 202 });
  } catch (error) {
    console.error("Early provision error:", error);
    return NextResponse.json(
      { error: "Failed to start provisioning" },
      { status: 500 }
    );
  }
}

async function startEarlyProvisioning(
  instanceId: string,
  clerkUserId: string,
  planId: string,
) {
  try {
    const workerUrl = process.env.WORKER_URL;
    const workerSecret = process.env.WORKER_SECRET;

    if (!workerUrl || !workerSecret) {
      throw new Error("Worker not configured");
    }

    // Get user email from Clerk
    const { clerkClient } = await import("@clerk/nextjs/server");
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(clerkUserId);
    const customerEmail = user.emailAddresses[0]?.emailAddress;

    if (!customerEmail) {
      throw new Error("User email not found");
    }

    // Get app URL for callback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.clawdhost.tech";

    // Call worker API with earlyMode = true (no config)
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
        instanceId,
        earlyMode: true, // No config, just spin up the server
        callbackUrl: `${appUrl}/api/provision/callback`,
        callbackSecret: workerSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Worker failed to start provisioning");
    }

  } catch (error) {
    console.error("Early provisioning error:", error);
    await updateInstanceStatus(
      instanceId, 
      "error", 
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
