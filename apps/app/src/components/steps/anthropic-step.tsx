"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding";
import { KeyRound, ExternalLink } from "lucide-react";

export function AnthropicStep() {
  const { anthropicKey, setAnthropicKey, setStep } = useOnboardingStore();
  const [key, setKey] = useState(anthropicKey);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!key.startsWith("sk-ant-")) {
      setError("Invalid API key format. It should start with sk-ant-");
      return;
    }
    setAnthropicKey(key);
    setStep("telegram");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
          <KeyRound className="w-6 h-6 text-orange-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">Anthropic API Key</h2>
        <p className="text-slate-600">
          Your MoltBot will use Claude to power conversations.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 mb-1">
            API Key
          </label>
          <Input
            id="api-key"
            type="password"
            placeholder="sk-ant-..."
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError("");
            }}
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Get your API key from Anthropic Console
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <Button onClick={handleContinue} size="lg" className="w-full" disabled={!key}>
        Continue
      </Button>
    </div>
  );
}
