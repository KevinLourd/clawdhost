"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding";
import { Zap, ExternalLink } from "lucide-react";

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
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">MoltBot Setup</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          MoltBot can execute actions, access files, and send messages on your behalf.
          <br />
          Give access and permissions mindfully.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group p-3 sm:p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
        <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          I understand that ClawdHost is a hosting service for MoltBot. I accept the risks 
          inherent with using MoltBot and agree not to hold ClawdHost liable for any damages, 
          losses, or consequences arising from MoltBot&apos;s actions. I have read and agree to the{" "}
          <a
            href="https://clawdhost.tech/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            Terms of Service
            <ExternalLink className="w-3 h-3" />
          </a>
          .
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
