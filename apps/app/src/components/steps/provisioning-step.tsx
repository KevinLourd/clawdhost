"use client";

import { useEffect, useRef } from "react";
import { useOnboardingStore } from "@/store/onboarding";
import { Loader2, CheckCircle2, XCircle, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "create", label: "Creating server" },
  { id: "configure", label: "Configuring MoltBot" },
  { id: "install", label: "Installing dependencies" },
  { id: "start", label: "Starting services" },
];

export function ProvisioningStep() {
  const {
    instanceId,
    provisioningStatus,
    provisioningMessage,
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Server className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Setting up your instance</h2>
        <p className="text-muted-foreground">
          This usually takes 2-3 minutes. You can stay on this page.
        </p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex && provisioningStatus === "running";
          const isError = provisioningStatus === "error" && index === currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrent ? "bg-primary/10 border border-primary/20" : "bg-muted"
              }`}
            >
              {isComplete && <CheckCircle2 className="w-5 h-5 text-primary" />}
              {isCurrent && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
              {isError && <XCircle className="w-5 h-5 text-red-600" />}
              {!isComplete && !isCurrent && !isError && (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
              )}
              <span
                className={`text-sm ${
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
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            {provisioningMessage || "An error occurred during provisioning."}
          </div>
          <Button onClick={startProvisioning} variant="outline" className="w-full">
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
