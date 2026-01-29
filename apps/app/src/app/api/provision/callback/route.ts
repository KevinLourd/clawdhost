import { NextRequest, NextResponse } from "next/server";
import { 
  updateInstanceStatus, 
  updateInstanceVps, 
  markInstanceReady 
} from "@/lib/db";

interface CallbackBody {
  instanceId: string;
  status: "ready" | "error";
  error?: string;
  provider?: string;
  serverId?: string;
  serverIp?: string;
  tunnelId?: string;
  tunnelUrl?: string;
  terminalUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify worker secret
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.WORKER_SECRET;

    if (!expectedToken) {
      console.error("[Callback] WORKER_SECRET not configured");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CallbackBody = await request.json();

    if (!body.instanceId || !body.status) {
      return NextResponse.json({ error: "Missing instanceId or status" }, { status: 400 });
    }

    console.log(`[Callback] Received for instance ${body.instanceId}: ${body.status}`);

    if (body.status === "ready") {
      // Update VPS info if provided
      if (body.provider && body.serverId && body.serverIp) {
        await updateInstanceVps(
          body.instanceId,
          body.provider,
          body.serverId,
          body.serverIp,
          body.tunnelId,
          body.tunnelUrl,
          body.terminalUrl
        );
      }
      
      // Mark instance as ready
      await markInstanceReady(body.instanceId);
      console.log(`[Callback] Instance ${body.instanceId} marked as ready`);
    } else if (body.status === "error") {
      await updateInstanceStatus(body.instanceId, "error", body.error);
      console.log(`[Callback] Instance ${body.instanceId} marked as error: ${body.error}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Callback] Error:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}
