"use client";

import { useEffect, useRef } from "react";
import { useOnboardingStore } from "@/store/onboarding";
import { Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "create", label: "Preparing your assistant" },
  { id: "configure", label: "Connecting to Telegram" },
  { id: "install", label: "Adding skills" },
  { id: "start", label: "Waking up your bot" },
];

export function ProvisioningStep() {
  const {
    instanceId,
    provisioningStatus,
    provisioningMessage,
    telegramBotUsername,
    setProvisioningStatus,
    setTerminalUrl,
    setStep,
    setError,
  } = useOnboardingStore();

  const hasStarted = useRef(false);

  useEffect(() => {
    if (provisioningStatus === "idle" && !hasStarted.current) {
      hasStarted.current = true;
      startProvisioning();
    } else if (provisioningStatus === "running" && instanceId) {
      // Resume polling if already running
      pollStatus(instanceId);
    }
  }, []);

  const startProvisioning = async () => {
    setProvisioningStatus("running", "create");

    try {
      const response = await fetch("/api/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Provisioning failed");
      }

      const { provisioningId } = await response.json();
      pollStatus(provisioningId);
    } catch (err) {
      setProvisioningStatus("error", (err as Error).message);
      setError((err as Error).message);
    }
  };

  const pollStatus = async (id: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/provision/status?id=${id}`);
        const data = await response.json();

        if (data.status === "complete") {
          setProvisioningStatus("complete");
          if (data.terminalUrl) {
            setTerminalUrl(data.terminalUrl);
          }
          setStep("complete");
          return;
        }

        if (data.status === "error") {
          setProvisioningStatus("error", data.message);
          setError(data.message);
          return;
        }

        setProvisioningStatus("running", data.currentStep || "configure");
        setTimeout(poll, 2000);
      } catch {
        setTimeout(poll, 3000);
      }
    };

    poll();
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === provisioningMessage);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
          {telegramBotUsername ? `Creating @${telegramBotUsername}` : "Creating your AI assistant"}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Almost there! This takes about 2 minutes.
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex && provisioningStatus === "running";
          const isError = provisioningStatus === "error" && index === currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg transition-colors ${
                isCurrent ? "bg-primary/10 border border-primary/20" : "bg-muted"
              }`}
            >
              {isComplete && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />}
              {isCurrent && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-spin shrink-0" />}
              {isError && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />}
              {!isComplete && !isCurrent && !isError && (
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
              )}
              <span
                className={`text-xs sm:text-sm ${
                  isComplete || isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {provisioningStatus === "error" && (
        <div className="space-y-2 sm:space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-red-800">
            Something went wrong. Please try again.
          </div>
          <Button onClick={startProvisioning} variant="outline" className="w-full">
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
