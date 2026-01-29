// Shared types and utilities for ClawdHost

export interface ProvisioningConfig {
  anthropicKey: string;
  telegramBotToken: string;
  plan?: "essential" | "apple" | "pro";
}

export interface InstanceInfo {
  id: string;
  status: "provisioning" | "running" | "stopped" | "error";
  instanceUrl: string;
  terminalUrl: string;
  telegramBotUsername?: string;
  createdAt: string;
}

export interface ProvisioningStatus {
  status: "pending" | "running" | "complete" | "error";
  currentStep: string;
  message?: string;
  instanceUrl?: string;
  terminalUrl?: string;
}
