import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserWithInstances, deleteUserAndInstances } from "@/lib/db";
import { deleteClerkUser } from "@/lib/clerk";
import { deleteHetznerServer } from "@/lib/hetzner";

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

    const results = {
      clerk: false,
      db: false,
      hetzner: false,
    };

    // 1. Delete Hetzner servers
    let hetznerSuccess = true;
    for (const instance of userData.instances) {
      if (instance.server_id && instance.provider === "hetzner") {
        const hetznerResult = await deleteHetznerServer(instance.server_id);
        if (!hetznerResult.success) {
          console.error(`Failed to delete Hetzner server ${instance.server_id}:`, hetznerResult.error);
          hetznerSuccess = false;
        }
      }
    }
    results.hetzner = hetznerSuccess;

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
