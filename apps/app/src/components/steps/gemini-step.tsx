"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding";
import { KeyRound, ExternalLink, Mic, Video, FileText } from "lucide-react";

export function GeminiStep() {
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

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiKey: key }),
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

  const handleSkip = () => {
    setStep("telegram");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Google Gemini API Key</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Optional. Enables video understanding and multimodal features.
        </p>
      </div>

      {/* Use cases */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gemini enables</p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Video className="w-4 h-4 text-primary" />
            <span>Video understanding and analysis</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Mic className="w-4 h-4 text-primary" />
            <span>Voice transcription (alternative to OpenAI)</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <FileText className="w-4 h-4 text-primary" />
            <span>Large document processing (2M token context)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="gemini-key" className="block text-sm font-medium text-foreground mb-1">
            API Key
          </label>
          <Input
            id="gemini-key"
            type="password"
            placeholder="AIza..."
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
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Get your API key from Google AI Studio
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleSkip} size="lg" className="flex-1">
          Skip
        </Button>
        <Button onClick={handleContinue} size="lg" className="flex-1" disabled={loading}>
          {loading ? "Saving..." : key ? "Continue" : "Skip"}
        </Button>
      </div>
    </div>
  );
}
