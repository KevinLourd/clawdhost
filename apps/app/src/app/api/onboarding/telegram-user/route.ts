import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  setTelegramOwner 
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ownerUsername } = await request.json();

    if (!ownerUsername || typeof ownerUsername !== "string") {
      return NextResponse.json(
        { error: "Your Telegram username is required" },
        { status: 400 }
      );
    }

    // Clean up username (remove @ if present)
    const cleanUsername = ownerUsername.trim().replace(/^@/, "");

    if (!cleanUsername) {
      return NextResponse.json(
        { error: "Your Telegram username is required" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    // Store owner username
    await setTelegramOwner(instance.id, cleanUsername);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set telegram owner error:", error);
    return NextResponse.json(
      { error: "Failed to save Telegram username" },
      { status: 500 }
    );
  }
}
