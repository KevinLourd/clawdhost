import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  setTelegramToken 
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { telegramBotToken } = await request.json();

    if (!telegramBotToken || telegramBotToken.length < 40) {
      return NextResponse.json(
        { error: "Invalid Telegram bot token" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    await setTelegramToken(instance.id, telegramBotToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set telegram token error:", error);
    return NextResponse.json(
      { error: "Failed to save Telegram token" },
      { status: 500 }
    );
  }
}
