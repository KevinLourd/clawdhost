import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  setTelegramConfig 
} from "@/lib/db";

interface TelegramBotInfo {
  ok: boolean;
  result?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
  };
  description?: string;
}

async function validateTelegramToken(token: string): Promise<{ valid: boolean; username?: string; error?: string }> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data: TelegramBotInfo = await response.json();
    
    if (!data.ok || !data.result) {
      return { valid: false, error: data.description || "Invalid token" };
    }
    
    if (!data.result.is_bot) {
      return { valid: false, error: "This is not a bot token" };
    }
    
    return { valid: true, username: data.result.username };
  } catch {
    return { valid: false, error: "Failed to connect to Telegram" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { telegramBotToken, ownerUsername } = await request.json();

    if (!telegramBotToken || !telegramBotToken.includes(":")) {
      return NextResponse.json(
        { error: "Invalid Telegram bot token format" },
        { status: 400 }
      );
    }

    if (!ownerUsername || typeof ownerUsername !== "string") {
      return NextResponse.json(
        { error: "Your Telegram username is required" },
        { status: 400 }
      );
    }

    // Validate token with Telegram API
    const validation = await validateTelegramToken(telegramBotToken);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid bot token" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    
    // Store token, bot username, and owner username
    await setTelegramConfig(instance.id, telegramBotToken, validation.username!, ownerUsername);

    return NextResponse.json({ 
      success: true,
      botUsername: validation.username 
    });
  } catch (error) {
    console.error("Set telegram token error:", error);
    return NextResponse.json(
      { error: "Failed to save Telegram token" },
      { status: 500 }
    );
  }
}
