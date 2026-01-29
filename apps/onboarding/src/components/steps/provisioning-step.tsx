"use client";

import { useEffect } from "react";
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
    anthropicKey,
    telegramBotToken,
    provisioningStatus,
    provisioningMessage,
    setProvisioningStatus,
    setInstanceUrls,
    setStep,
    setError,
  } = useOnboardingStore();

  useEffect(() => {
    if (provisioningStatus === "idle") {
      startProvisioning();
    }
  }, []);

  const startProvisioning = async () => {
    setProvisioningStatus("running", "create");

    try {
      const response = await fetch("/api/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anthropicKey,
          telegramBotToken,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Provisioning failed");
      }

      // Poll for status
      const { provisioningId } = await response.json();
      pollStatus(provisioningId);
    } catch (err) {
      setProvisioningStatus("error", (err as Error).message);
      setError((err as Error).message);
    }
  };

  const pollStatus = async (provisioningId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/provision/status?id=${provisioningId}`);
        const data = await response.json();

        if (data.status === "complete") {
          setProvisioningStatus("complete");
          setInstanceUrls(data.instanceUrl, data.terminalUrl);
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
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <Server className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">Setting up your instance</h2>
        <p className="text-slate-600">
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
                isCurrent ? "bg-green-50 border border-green-200" : "bg-slate-50"
              }`}
            >
              {isComplete && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {isCurrent && <Loader2 className="w-5 h-5 text-green-600 animate-spin" />}
              {isError && <XCircle className="w-5 h-5 text-red-600" />}
              {!isComplete && !isCurrent && !isError && (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
              )}
              <span
                className={`text-sm ${
                  isComplete || isCurrent ? "text-slate-900 font-medium" : "text-slate-500"
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
