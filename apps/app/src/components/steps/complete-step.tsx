"use client";

import { useOnboardingStore } from "@/store/onboarding";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, MessageCircle, Terminal } from "lucide-react";

export function CompleteStep() {
  const { instanceUrl, terminalUrl, telegramBotToken } = useOnboardingStore();

  // Extract bot username from token for Telegram link (first part before :)
  const botId = telegramBotToken.split(":")[0];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">You&apos;re all set!</h2>
        <p className="text-slate-600">
          Your MoltBot instance is ready. Start chatting with your AI assistant.
        </p>
      </div>

      <div className="space-y-3">
        <a
          href={`https://t.me/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium text-slate-900">Open Telegram Bot</p>
            <p className="text-sm text-slate-600">Start chatting with your assistant</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </a>

        {terminalUrl && (
          <a
            href={terminalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <Terminal className="w-5 h-5 text-slate-600" />
            <div className="flex-1">
              <p className="font-medium text-slate-900">Web Terminal</p>
              <p className="text-sm text-slate-600">Advanced configuration and logs</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
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

      <div className="text-center text-sm text-slate-500">
        <p>Need help? Check out the <a href="https://docs.clawd.bot" className="text-primary hover:underline">MoltBot documentation</a></p>
      </div>
    </div>
  );
}
