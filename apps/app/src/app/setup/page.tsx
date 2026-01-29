"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useOnboardingStore } from "@/store/onboarding";
import { identifyUser } from "@/lib/posthog";
import {
  WelcomeStep,
  AnthropicStep,
  TelegramStep,
  TelegramUserStep,
  ProvisioningStep,
  CompleteStep,
} from "@/components/steps";
import { LogOut } from "lucide-react";

const STEP_LABELS = {
  anthropic: "API Key",
  telegram: "Bot",
  "telegram-user": "Access",
  provisioning: "Setup",
  complete: "Done",
};

export default function SetupPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { step, isLoading, setStep, setInstanceId, setTerminalUrl, setTelegramBotUsername, setLoading, setProvisioningStatus } = useOnboardingStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get display name (prefer name over email)
  const displayName = user?.firstName || user?.fullName || user?.emailAddresses[0]?.emailAddress;
  const initials = user?.firstName?.[0]?.toUpperCase() || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "?";

  // Identify user in PostHog when loaded
  useEffect(() => {
    if (isLoaded && user) {
      const email = user.emailAddresses[0]?.emailAddress;
      if (email) {
        identifyUser(email, {
          name: user.fullName || user.firstName,
          clerk_user_id: user.id,
          created_at: user.createdAt,
        });
      }
    }
  }, [isLoaded, user]);

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
          if (data.telegramBotUsername) {
            setTelegramBotUsername(data.telegramBotUsername);
          }
          // If we're on provisioning step with an instanceId, set status to resume polling
          if (data.step === "provisioning" && data.instanceId) {
            // Map DB status to store status
            if (data.status === "ready") {
              setProvisioningStatus("complete");
            } else if (data.status === "error") {
              setProvisioningStatus("error");
            } else if (data.status === "provisioning" || data.status === "configuring") {
              setProvisioningStatus("running", "create");
            }
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
  }, [isLoaded, setStep, setInstanceId, setTerminalUrl, setTelegramBotUsername, setLoading, setProvisioningStatus]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const steps = Object.keys(STEP_LABELS) as Array<keyof typeof STEP_LABELS>;
  // Welcome step is not in progress bar, so map it to -1
  const currentIndex = step === "welcome" ? -1 : steps.indexOf(step as keyof typeof STEP_LABELS);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <a href="https://clawdhost.tech" className="flex items-center gap-2">
            <img 
              src="/clawdhost_logo_27kb.jpg" 
              alt="ClawdHost" 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg"
            />
            <span className="font-semibold text-foreground hidden sm:inline">ClawdHost</span>
            <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              beta
            </span>
          </a>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-xs sm:text-sm text-muted-foreground max-w-[120px] sm:max-w-none truncate">
                {displayName}
              </span>
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={displayName || "User"} 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {initials}
                </div>
              )}
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-card border rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => signOut({ redirectUrl: "/sign-in" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-card border-b">
        <div className="max-w-2xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
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
                    className={`text-[10px] sm:text-xs mt-1 ${
                      index <= currentIndex ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 md:w-24 h-0.5 mx-1 sm:mx-2 ${
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
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md bg-card rounded-xl sm:rounded-2xl shadow-lg border p-4 sm:p-6 md:p-8">
          {step === "welcome" && <WelcomeStep />}
          {step === "anthropic" && <AnthropicStep />}
          {step === "telegram" && <TelegramStep />}
          {step === "telegram-user" && <TelegramUserStep />}
          {step === "provisioning" && <ProvisioningStep />}
          {step === "complete" && <CompleteStep />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80">
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4 text-center text-xs sm:text-sm text-muted-foreground">
          Need help? <a href="mailto:support@clawdhost.tech" className="text-primary hover:underline">Contact support</a>
        </div>
      </footer>
    </div>
  );
}
