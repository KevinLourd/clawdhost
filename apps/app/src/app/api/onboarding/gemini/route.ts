import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  setGeminiKey 
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { geminiKey } = await request.json();

    // Gemini keys typically start with "AIza" but we won't enforce format
    // since Google may change it

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    // Pass null if key is empty (user skipped)
    await setGeminiKey(instance.id, geminiKey || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set Gemini key error:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}
