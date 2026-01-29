"use client";

import { useEffect, useRef } from "react";
import { useOnboardingStore } from "@/store/onboarding";
import { Loader2, CheckCircle2, XCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

// 4 user-friendly steps with reassuring vocabulary
const STEPS = [
  { id: "infrastructure", label: "Setting up secure infrastructure" },
  { id: "server", label: "Preparing your private server" },
  { id: "installing", label: "Installing your AI assistant" },
  { id: "connecting", label: "Establishing secure connection" },
];

export function ProvisioningStep() {
  const {
    instanceId,
    provisioningStatus,
    provisioningMessage,
    telegramBotUsername,
    setProvisioningStatus,
    setStep,
    setError,
  } = useOnboardingStore();

  const hasStarted = useRef(false);
  const isPolling = useRef(false);

  useEffect(() => {
    // If we already have an instanceId and we're running, resume polling
    if (provisioningStatus === "running" && instanceId && !isPolling.current) {
      isPolling.current = true;
      pollStatus(instanceId);
      return;
    }
    
    // Start provisioning if idle and never started
    // (instanceId may already exist from pending instance - that's fine)
    if (provisioningStatus === "idle" && !hasStarted.current) {
      hasStarted.current = true;
      startProvisioning();
    }
  }, [provisioningStatus, instanceId]);

  const startProvisioning = async () => {
    setProvisioningStatus("running", "infrastructure");

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
          setStep("complete");
          return;
        }

        if (data.status === "error") {
          setProvisioningStatus("error", data.message);
          setError(data.message);
          return;
        }

        // Use currentStep from the API (infrastructure, server, installing, connecting)
        setProvisioningStatus("running", data.currentStep || "infrastructure");
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
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
          {telegramBotUsername ? `Setting up @${telegramBotUsername}` : "Setting up your AI assistant"}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Creating your secure, private environment. This takes about 2 minutes.
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
                isComplete ? "bg-emerald-50 border border-emerald-200" :
                isCurrent ? "bg-emerald-50 border border-emerald-300" : "bg-muted"
              }`}
            >
              {isComplete && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />}
              {isCurrent && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 animate-spin shrink-0" />}
              {isError && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />}
              {!isComplete && !isCurrent && !isError && (
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
              )}
              <span
                className={`text-xs sm:text-sm ${
                  isComplete ? "text-emerald-800 font-medium" :
                  isCurrent ? "text-emerald-900 font-medium" : "text-muted-foreground"
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
