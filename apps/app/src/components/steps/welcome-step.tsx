"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding";
import { Shield, ExternalLink, AlertTriangle } from "lucide-react";

export function WelcomeStep() {
  const { setStep } = useOnboardingStore();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/disclaimer", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setStep("anthropic");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Before you start</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          MoltBot is powerful. Please read this carefully.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 space-y-2">
            <p className="font-medium">MoltBot can:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              <li>Execute commands on your server</li>
              <li>Read and write files</li>
              <li>Browse the web and access online services</li>
              <li>Send messages on your behalf</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground space-y-2">
        <p>
          By design, MoltBot has significant capabilities. This makes it useful — but also means 
          you should understand the security implications.
        </p>
        <p>
          We recommend reading the{" "}
          <a
            href="https://docs.clawd.bot/gateway/security"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            MoltBot security documentation
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
        <span className="text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
          I understand this is powerful and inherently risky.
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <Button 
        onClick={handleContinue} 
        size="lg" 
        className="w-full" 
        disabled={!accepted || loading}
      >
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
