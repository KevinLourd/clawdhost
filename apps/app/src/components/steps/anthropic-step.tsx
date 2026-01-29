"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding";
import { KeyRound, ExternalLink } from "lucide-react";

export function AnthropicStep() {
  const { setStep } = useOnboardingStore();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!key.startsWith("sk-ant-")) {
      setError("Invalid API key format. It should start with sk-ant-");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropicKey: key }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save API key");
      }

      setStep("telegram");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <KeyRound className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Anthropic API Key</h2>
        <p className="text-muted-foreground">
          Your MoltBot will use Claude to power conversations.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-foreground mb-1">
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

      <Button onClick={handleContinue} size="lg" className="w-full" disabled={!key || loading}>
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
