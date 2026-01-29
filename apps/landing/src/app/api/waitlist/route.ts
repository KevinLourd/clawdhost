import { NextResponse } from "next/server";
import { sendWaitlistEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, planName } = await request.json();

    if (!email || !planName) {
      return NextResponse.json(
        { error: "Email and plan name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    await sendWaitlistEmail({ to: email, planName });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist. Please try again." },
      { status: 500 }
    );
  }
}
