"use client";

import { useOnboardingStore } from "@/store/onboarding";
import { CheckCircle2, ExternalLink, MessageCircle, Terminal } from "lucide-react";

export function CompleteStep() {
  const { terminalUrl, telegramBotUsername } = useOnboardingStore();

  const telegramLink = telegramBotUsername 
    ? `https://t.me/${telegramBotUsername}` 
    : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">You&apos;re all set!</h2>
        <p className="text-muted-foreground">
          Your MoltBot is live. Start chatting now.
        </p>
      </div>

      <div className="space-y-3">
        {telegramLink ? (
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Open @{telegramBotUsername}</p>
              <p className="text-sm text-muted-foreground">Start chatting with your AI assistant</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Open your Telegram bot</p>
              <p className="text-sm text-muted-foreground">Start chatting with your AI assistant</p>
            </div>
          </div>
        )}

        {terminalUrl && (
          <a
            href={terminalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted border border-border hover:bg-accent transition-colors"
          >
            <Terminal className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Web Terminal</p>
              <p className="text-sm text-muted-foreground">Advanced configuration and logs</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
        <p className="font-medium mb-1">What&apos;s included:</p>
        <ul className="space-y-1">
          <li>• Claude Sonnet 4 as your AI model</li>
          <li>• Pre-installed skills: web search, coding, file management</li>
          <li>• Session memory (conversations saved automatically)</li>
          <li>• 24/7 availability on your dedicated server</li>
        </ul>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Need help? Check out the <a href="https://docs.clawd.bot" className="text-primary hover:underline">MoltBot documentation</a></p>
      </div>
    </div>
  );
}
