import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  updateInstanceStatus,
  getOnboardingStep,
} from "@/lib/db";

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    // Verify config is complete
    const step = getOnboardingStep(instance);
    if (step !== "provisioning") {
      return NextResponse.json(
        { error: `Onboarding not complete. Current step: ${step}` },
        { status: 400 }
      );
    }

    // Check if already provisioning
    if (instance.status === "provisioning" || instance.status === "configuring") {
      return NextResponse.json({ 
        provisioningId: instance.id,
        status: instance.status,
        message: "Provisioning already in progress"
      });
    }

    // Start provisioning in background
    await updateInstanceStatus(instance.id, "provisioning");
    startProvisioning(instance.id, clerkUserId, instance.plan_id, instance.moltbot_config || {});

    return NextResponse.json({ 
      provisioningId: instance.id,
      status: "provisioning" 
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";

    // Call worker API with config
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
        moltbotConfig,
        callbackUrl: `${appUrl}/api/provision/callback`,
        callbackSecret: workerSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Worker failed to start provisioning");
    }

  } catch (error) {
    console.error("Provisioning error:", error);
    await updateInstanceStatus(
      instanceId, 
      "error", 
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
