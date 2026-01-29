import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserWithInstances, deleteUserAndInstances } from "@/lib/db";
import { deleteClerkUser, getClerkUser } from "@/lib/clerk";
import { deprovisionServer } from "@/lib/hetzner";

const ALLOWED_EMAILS = ["kevin@clawdhost.tech"];

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const { sessionClaims } = await auth();
    const email = sessionClaims?.email as string | undefined;
    
    if (!email || !ALLOWED_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { clerkUserId } = await request.json();

    // Get user data first
    const userData = await getUserWithInstances(id);
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get Clerk user email for deprovisioning
    const clerkUser = await getClerkUser(clerkUserId);
    const customerEmail = clerkUser?.emailAddresses[0]?.emailAddress || "unknown@unknown.com";

    const results = {
      clerk: false,
      db: false,
      servers: false,
    };

    // 1. Deprovision servers via worker
    let serversSuccess = true;
    for (const instance of userData.instances) {
      if (instance.server_id && instance.provider) {
        const result = await deprovisionServer({
          serverId: instance.server_id,
          tunnelId: instance.tunnel_id || undefined,
          provider: instance.provider,
          customerEmail,
          reason: "admin_deletion",
        });
        if (!result.success) {
          console.error(`Failed to deprovision server ${instance.server_id}:`, result.error);
          serversSuccess = false;
        }
      }
    }
    results.servers = serversSuccess;

    // 2. Delete from Clerk
    const clerkResult = await deleteClerkUser(clerkUserId);
    results.clerk = clerkResult.success;
    if (!clerkResult.success) {
      console.error(`Failed to delete Clerk user ${clerkUserId}:`, clerkResult.error);
    }

    // 3. Delete from database
    try {
      await deleteUserAndInstances(id);
      results.db = true;
    } catch (dbError) {
      console.error(`Failed to delete DB user ${id}:`, dbError);
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
