import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getOrCreateUser, 
  getOrCreateDraftInstance,
  getOnboardingStep 
} from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUserId);
    const instance = await getOrCreateDraftInstance(user.id);
    const step = getOnboardingStep(instance);

    // Check what config exists (without exposing actual keys)
    const config = instance.moltbot_config as Record<string, unknown> | null;
    const auth_config = config?.auth as Record<string, unknown> | undefined;
    const channels = config?.channels as Record<string, unknown> | undefined;

    return NextResponse.json({
      step,
      instanceId: instance.id,
      status: instance.status,
      hasAnthropicKey: !!auth_config?.anthropicKey,
      hasTelegramToken: !!(channels?.telegram as Record<string, unknown>)?.botToken,
      terminalUrl: instance.terminal_url,
    });
  } catch (error) {
    console.error("Onboarding status error:", error);
    return NextResponse.json(
      { error: "Failed to get onboarding status" },
      { status: 500 }
    );
  }
}
