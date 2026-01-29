"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding";
import { MessageCircle, ExternalLink, ArrowLeft } from "lucide-react";

export function TelegramStep() {
  const { telegramBotToken, setTelegramBotToken, setStep } = useOnboardingStore();
  const [token, setToken] = useState(telegramBotToken);
  const [error, setError] = useState("");

  const handleContinue = () => {
    // Basic Telegram bot token validation
    if (!token.includes(":")) {
      setError("Invalid bot token format");
      return;
    }
    setTelegramBotToken(token);
    setStep("provisioning");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">Telegram Bot</h2>
        <p className="text-slate-600">
          Connect your Telegram bot to chat with your AI assistant.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="bot-token" className="block text-sm font-medium text-slate-700 mb-1">
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

        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 space-y-2">
          <p className="font-medium text-slate-700">How to create a Telegram bot:</p>
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
        <Button onClick={handleContinue} size="lg" className="flex-[2]" disabled={!token}>
          Launch Instance
        </Button>
      </div>
    </div>
  );
}
