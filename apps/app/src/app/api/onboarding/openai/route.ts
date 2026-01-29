import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  setOpenAIKey 
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { openaiKey } = await request.json();

    // Validate key format if provided (optional key)
    if (openaiKey && !openaiKey.startsWith("sk-")) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key format" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    // Pass null if key is empty (user skipped)
    await setOpenAIKey(instance.id, openaiKey || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set OpenAI key error:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}
