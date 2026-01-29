"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding";
import { MessageCircle, ExternalLink, ArrowLeft } from "lucide-react";

export function TelegramStep() {
  const { setStep } = useOnboardingStore();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!token.includes(":")) {
      setError("Invalid bot token format");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramBotToken: token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save bot token");
      }

      setStep("provisioning");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Telegram Bot</h2>
        <p className="text-muted-foreground">
          Connect your Telegram bot to chat with your AI assistant.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="bot-token" className="block text-sm font-medium text-foreground mb-1">
            Bot Token
          </label>
          <Input
            id="bot-token"
            type="password"
            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setError("");
            }}
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground space-y-2">
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
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Open BotFather on Telegram
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <p className="font-medium">Coming soon:</p>
        <p>WhatsApp, Discord, iMessage, and more channels.</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("anthropic")} className="flex-1">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleContinue} size="lg" className="flex-[2]" disabled={!token || loading}>
          {loading ? "Saving..." : "Launch Instance"}
        </Button>
      </div>
    </div>
  );
}
