import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  setAnthropicKey 
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { anthropicKey } = await request.json();

    if (!anthropicKey || !anthropicKey.startsWith("sk-ant-")) {
      return NextResponse.json(
        { error: "Invalid Anthropic API key format" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    await setAnthropicKey(instance.id, anthropicKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set anthropic key error:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}
