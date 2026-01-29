import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getInstanceById, getProvisioningProgress } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get("id");

    if (!instanceId) {
      return NextResponse.json({ error: "Missing instance ID" }, { status: 400 });
    }

    const instance = await getInstanceById(instanceId);

    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    // Map instance status to provisioning status
    let status: "pending" | "running" | "complete" | "error";
    let currentStep = "infrastructure";
    let progress = 0;

    // Get real-time provisioning progress
    const provisioningProgress = getProvisioningProgress(instance);

    switch (instance.status) {
      case "pending":
        status = "pending";
        break;
      case "provisioning":
      case "configuring":
        status = "running";
        // Use real progress from callbacks if available
        if (provisioningProgress) {
          currentStep = provisioningProgress.step;
          progress = provisioningProgress.progress;
        }
        break;
      case "ready":
        status = "complete";
        currentStep = "complete";
        progress = 100;
        break;
      case "error":
        status = "error";
        break;
      default:
        status = "pending";
    }

    return NextResponse.json({
      status,
      currentStep,
      progress,
      message: instance.error_message,
      terminalUrl: instance.terminal_url,
      instanceUrl: instance.tunnel_url,
    });
  } catch (error) {
    console.error("Provision status error:", error);
    return NextResponse.json(
      { error: "Failed to get provisioning status" },
      { status: 500 }
    );
  }
}
