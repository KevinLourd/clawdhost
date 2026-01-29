"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding";
import { ArrowLeft, Shield, Users } from "lucide-react";
import Image from "next/image";

const logoDevToken = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

export function TelegramUserStep() {
  const { setStep, telegramBotUsername } = useOnboardingStore();
  const [telegramUsername, setTelegramUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!telegramUsername.trim()) {
      setError("Please enter your Telegram username");
      return;
    }

    setLoading(true);
    setError("");

    // Clean up telegram username (remove @ if present)
    const cleanUsername = telegramUsername.trim().replace(/^@/, "");

    try {
      const response = await fetch("/api/onboarding/telegram-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerUsername: cleanUsername }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save username");
      }

      setStep("provisioning");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
          <Image
            src={`https://img.logo.dev/telegram.org?token=${logoDevToken}`}
            alt="Telegram"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Your Telegram Account</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {telegramBotUsername ? (
            <>Link your Telegram to <span className="font-medium">@{telegramBotUsername}</span></>
          ) : (
            "Link your Telegram account to your bot"
          )}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="telegram-username" className="block text-sm font-medium text-foreground mb-1">
            Your Telegram Username
          </label>
          <Input
            id="telegram-username"
            type="text"
            name="tg_user_noautofill"
            placeholder="@your_username"
            value={telegramUsername}
            onChange={(e) => {
              setTelegramUsername(e.target.value);
              setError("");
            }}
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-900">Security first</p>
              <p className="text-xs sm:text-sm text-emerald-700">
                Your bot will only respond to messages from your account. This prevents unauthorized access.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-900">Add more users later</p>
              <p className="text-xs sm:text-sm text-emerald-700">
                You can authorize additional Telegram users from your dashboard after setup.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <Button variant="outline" onClick={() => setStep("telegram")} className="flex-1" size="default">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Back</span>
        </Button>
        <Button onClick={handleContinue} className="flex-[2]" disabled={!telegramUsername.trim() || loading}>
          {loading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
