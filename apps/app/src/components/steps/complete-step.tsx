"use client";

import { useOnboardingStore } from "@/store/onboarding";
import { CheckCircle2, ExternalLink, MessageCircle } from "lucide-react";

export function CompleteStep() {
  const { telegramBotUsername } = useOnboardingStore();

  const telegramLink = telegramBotUsername 
    ? `https://t.me/${telegramBotUsername}` 
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">You&apos;re all set!</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Your MoltBot is live. Start chatting now.
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {telegramLink ? (
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm sm:text-base truncate">Open @{telegramBotUsername}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Start chatting with your AI assistant</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
          </a>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
            <MessageCircle className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm sm:text-base">Open your Telegram bot</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Start chatting with your AI assistant</p>
            </div>
          </div>
        )}

      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-green-800">
        <p className="font-medium mb-1">What&apos;s included:</p>
        <ul className="space-y-0.5 sm:space-y-1">
          <li>• Claude Opus 4.5 as your AI model</li>
          <li>• Pre-installed skills: web search, coding, file management</li>
          <li>• Session memory (conversations saved automatically)</li>
          <li>• 24/7 availability on your dedicated server</li>
        </ul>
      </div>

      <div className="text-center text-xs sm:text-sm text-muted-foreground">
        <p>Need help? Check out the <a href="https://docs.clawd.bot" className="text-primary hover:underline">MoltBot documentation</a></p>
      </div>
    </div>
  );
}
