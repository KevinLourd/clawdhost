import { create } from "zustand";

export type OnboardingStep = "welcome" | "anthropic" | "telegram" | "provisioning" | "complete";

interface OnboardingState {
  step: OnboardingStep;
  instanceId: string | null;
  provisioningStatus: "idle" | "pending" | "running" | "complete" | "error";
  provisioningMessage: string;
  terminalUrl: string | null;
  telegramBotUsername: string | null;
  error: string | null;
  isLoading: boolean;

  setStep: (step: OnboardingStep) => void;
  setInstanceId: (id: string) => void;
  setProvisioningStatus: (status: OnboardingState["provisioningStatus"], message?: string) => void;
  setTerminalUrl: (url: string) => void;
  setTelegramBotUsername: (username: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  step: "welcome" as OnboardingStep,
  instanceId: null as string | null,
  provisioningStatus: "idle" as const,
  provisioningMessage: "",
  terminalUrl: null as string | null,
  telegramBotUsername: null as string | null,
  error: null as string | null,
  isLoading: true,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setInstanceId: (instanceId) => set({ instanceId }),
  setProvisioningStatus: (provisioningStatus, provisioningMessage = "") =>
    set({ provisioningStatus, provisioningMessage }),
  setTerminalUrl: (terminalUrl) => set({ terminalUrl }),
  setTelegramBotUsername: (telegramBotUsername) => set({ telegramBotUsername }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));
