"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding";
import { KeyRound, ExternalLink, Mic, Image } from "lucide-react";

export function OpenAIStep() {
  const { setStep } = useOnboardingStore();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    // Skip if empty (optional key)
    if (!key) {
      setStep("telegram");
      return;
    }

    if (!key.startsWith("sk-")) {
      setError("Invalid API key format. It should start with sk-");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openaiKey: key }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save API key");
      }

      setStep("telegram");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Mark as configured (skipped) in DB
    try {
      await fetch("/api/onboarding/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openaiKey: "" }),
      });
    } catch {
      // Continue anyway
    }
    setStep("telegram");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">OpenAI API Key</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Optional. Enables voice messages and additional features.
        </p>
      </div>

      {/* Use cases */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">OpenAI enables</p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Mic className="w-4 h-4 text-primary" />
            <span>Voice message transcription (Whisper)</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Image className="w-4 h-4 text-primary" />
            <span>Image understanding (GPT-5.2)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="openai-key" className="block text-sm font-medium text-foreground mb-1">
            API Key
          </label>
          <Input
            id="openai-key"
            type="password"
            placeholder="sk-..."
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError("");
            }}
            className={error ? "border-red-500" : ""}
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Get your API key from OpenAI Platform
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("gemini")} size="lg" className="flex-1">
          Previous
        </Button>
        {key ? (
          <Button onClick={handleContinue} size="lg" className="flex-1" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleSkip} size="lg" className="flex-1">
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
