"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useOnboardingStore } from "@/store/onboarding";
import {
  AnthropicStep,
  TelegramStep,
  ProvisioningStep,
  CompleteStep,
} from "@/components/steps";
import { UserButton } from "@clerk/nextjs";

const STEP_LABELS = {
  anthropic: "API Key",
  telegram: "Channel",
  provisioning: "Setup",
  complete: "Done",
};

export default function SetupPage() {
  const { user, isLoaded } = useUser();
  const { step, isLoading, setStep, setInstanceId, setTerminalUrl, setLoading } = useOnboardingStore();

  // Fetch onboarding status on mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/onboarding/status");
        if (response.ok) {
          const data = await response.json();
          setStep(data.step);
          setInstanceId(data.instanceId);
          if (data.terminalUrl) {
            setTerminalUrl(data.terminalUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch onboarding status:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      fetchStatus();
    }
  }, [isLoaded, setStep, setInstanceId, setTerminalUrl, setLoading]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const steps = Object.keys(STEP_LABELS) as Array<keyof typeof STEP_LABELS>;
  const currentIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="https://clawdhost.tech" className="flex items-center gap-2">
            <img 
              src="/clawdhost_logo_27kb.jpg" 
              alt="ClawdHost" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-semibold text-foreground">ClawdHost</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-card border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index < currentIndex
                        ? "bg-primary text-primary-foreground"
                        : index === currentIndex
                        ? "bg-primary/10 text-primary ring-2 ring-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index < currentIndex ? "✓" : index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      index <= currentIndex ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 mx-2 ${
                      index < currentIndex ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border p-6 sm:p-8">
          {step === "anthropic" && <AnthropicStep />}
          {step === "telegram" && <TelegramStep />}
          {step === "provisioning" && <ProvisioningStep />}
          {step === "complete" && <CompleteStep />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Powered by <a href="https://molt.bot" className="text-primary hover:underline">MoltBot</a>
        </div>
      </footer>
    </div>
  );
}
