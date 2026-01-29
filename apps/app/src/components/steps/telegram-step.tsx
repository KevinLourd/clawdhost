"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding";
import { ExternalLink, ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const logoDevToken = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

export function TelegramStep() {
  const { setStep, setTelegramBotUsername } = useOnboardingStore();
  const [token, setToken] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [botName, setBotName] = useState<string | null>(null);
  const validateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate token and fetch bot name
  useEffect(() => {
    if (validateTimeoutRef.current) {
      clearTimeout(validateTimeoutRef.current);
    }
    
    setBotName(null);
    
    if (!token.includes(":")) {
      return;
    }

    setValidating(true);
    validateTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const data = await res.json();
        
        if (data.ok && data.result?.username) {
          setBotName(data.result.username);
          setError("");
        } else {
          setError("Invalid bot token");
        }
      } catch {
        setError("Failed to validate token");
      } finally {
        setValidating(false);
      }
    }, 500);

    return () => {
      if (validateTimeoutRef.current) {
        clearTimeout(validateTimeoutRef.current);
      }
    };
  }, [token]);

  const handleContinue = async () => {
    if (!token.includes(":") || !botName) {
      setError("Please enter a valid bot token");
      return;
    }

    if (!telegramUsername.trim()) {
      setError("Please enter your Telegram username");
      return;
    }

    setLoading(true);
    setError("");

    // Clean up telegram username (remove @ if present)
    const cleanUsername = telegramUsername.trim().replace(/^@/, "");

    try {
      const response = await fetch("/api/onboarding/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          telegramBotToken: token,
          ownerUsername: cleanUsername,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save bot token");
      }

      // Save bot username to store for later steps
      setTelegramBotUsername(botName);
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
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Telegram Bot</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Connect your Telegram bot to chat with your AI assistant.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="bot-token" className="block text-sm font-medium text-foreground mb-1">
            Bot Token
          </label>
          <div className="relative">
            <Input
              id="bot-token"
              type="password"
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError("");
              }}
              className={error ? "border-red-500" : botName ? "border-green-500 pr-10" : ""}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
            />
            {validating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {botName && !validating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          {botName && (
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              Bot found: <span className="font-medium">@{botName}</span>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="telegram-username" className="block text-sm font-medium text-foreground mb-1">
            Your Telegram Username
          </label>
          <Input
            id="telegram-username"
            type="text"
            placeholder="@your_username"
            value={telegramUsername}
            onChange={(e) => {
              setTelegramUsername(e.target.value);
              setError("");
            }}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This grants you access to chat with your bot.
          </p>
        </div>

        <div className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">How to create a Telegram bot:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open Telegram and search for @BotFather</li>
            <li>Send /newbot and follow the instructions</li>
            <li>Copy the token BotFather gives you</li>
          </ol>
        </div>

        <a
          href="https://t.me/BotFather"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary hover:underline"
        >
          Open BotFather on Telegram
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-amber-800">
        <p className="font-medium">Coming soon:</p>
        <p>WhatsApp, Discord, iMessage, and more channels.</p>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <Button variant="outline" onClick={() => setStep("anthropic")} className="flex-1" size="default">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Back</span>
        </Button>
        <Button onClick={handleContinue} className="flex-[2]" disabled={!token || !botName || !telegramUsername.trim() || loading}>
          {loading ? "Creating..." : botName && telegramUsername.trim() ? `Create @${botName}` : "Complete all fields"}
        </Button>
      </div>
    </div>
  );
}
