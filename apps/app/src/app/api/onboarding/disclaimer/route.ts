import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  acceptDisclaimer 
} from "@/lib/db";

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    await acceptDisclaimer(instance.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accept disclaimer error:", error);
    return NextResponse.json(
      { error: "Failed to accept disclaimer" },
      { status: 500 }
    );
  }
}
