import { create } from "zustand";

export type OnboardingStep = "anthropic" | "telegram" | "provisioning" | "complete";

interface OnboardingState {
  step: OnboardingStep;
  anthropicKey: string;
  telegramBotToken: string;
  provisioningStatus: "idle" | "pending" | "running" | "complete" | "error";
  provisioningMessage: string;
  instanceUrl: string | null;
  terminalUrl: string | null;
  error: string | null;

  setStep: (step: OnboardingStep) => void;
  setAnthropicKey: (key: string) => void;
  setTelegramBotToken: (token: string) => void;
  setProvisioningStatus: (status: OnboardingState["provisioningStatus"], message?: string) => void;
  setInstanceUrls: (instanceUrl: string, terminalUrl: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: "anthropic" as OnboardingStep,
  anthropicKey: "",
  telegramBotToken: "",
  provisioningStatus: "idle" as const,
  provisioningMessage: "",
  instanceUrl: null,
  terminalUrl: null,
  error: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setAnthropicKey: (anthropicKey) => set({ anthropicKey }),
  setTelegramBotToken: (telegramBotToken) => set({ telegramBotToken }),
  setProvisioningStatus: (provisioningStatus, provisioningMessage = "") =>
    set({ provisioningStatus, provisioningMessage }),
  setInstanceUrls: (instanceUrl, terminalUrl) => set({ instanceUrl, terminalUrl }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
