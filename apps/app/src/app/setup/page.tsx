"use client";

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
  const { step } = useOnboardingStore();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  const steps = Object.keys(STEP_LABELS) as Array<keyof typeof STEP_LABELS>;
  const currentIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-slate-900">ClawdHost</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.emailAddresses[0]?.emailAddress}</span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index < currentIndex
                        ? "bg-green-600 text-white"
                        : index === currentIndex
                        ? "bg-green-100 text-green-700 ring-2 ring-green-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {index < currentIndex ? "✓" : index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      index <= currentIndex ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 mx-2 ${
                      index < currentIndex ? "bg-green-600" : "bg-slate-200"
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
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-6 sm:p-8">
          {step === "anthropic" && <AnthropicStep />}
          {step === "telegram" && <TelegramStep />}
          {step === "provisioning" && <ProvisioningStep />}
          {step === "complete" && <CompleteStep />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center text-sm text-slate-500">
          Powered by <a href="https://moltbot.com" className="text-primary hover:underline">MoltBot</a>
        </div>
      </footer>
    </div>
  );
}
