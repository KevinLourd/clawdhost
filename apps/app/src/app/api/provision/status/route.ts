import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { provisioningStatus } from "../route";
import { getInstanceById } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  // Check in-memory status first
  const memoryStatus = provisioningStatus.get(id);
  
  if (memoryStatus) {
    // Get instance from DB for additional info
    const instance = await getInstanceById(id);
    
    return NextResponse.json({
      ...memoryStatus,
      instanceUrl: instance?.tunnel_url,
      terminalUrl: instance?.terminal_url,
    });
  }

  // Fallback to DB
  const instance = await getInstanceById(id);
  
  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: instance.status,
    currentStep: instance.status === "ready" ? "complete" : instance.status,
    instanceUrl: instance.tunnel_url,
    terminalUrl: instance.terminal_url,
    message: instance.error_message,
  });
}
