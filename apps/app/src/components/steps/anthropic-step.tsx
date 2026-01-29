"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding";
import { KeyRound, ExternalLink, Brain, MessageSquare, Code, Sparkles } from "lucide-react";

export function AnthropicStep() {
  const { setStep, setInstanceId } = useOnboardingStore();
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
      // Step 1: Save the Anthropic key
      const saveResponse = await fetch("/api/onboarding/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropicKey: key }),
      });

      if (!saveResponse.ok) {
        const data = await saveResponse.json();
        throw new Error(data.error || "Failed to save API key");
      }

      // Step 2: Start early provisioning (fire & forget)
      // This starts the server while the user fills in the rest of the config
      const provisionResponse = await fetch("/api/provision/early", {
        method: "POST",
      });

      if (provisionResponse.ok) {
        const { instanceId } = await provisionResponse.json();
        if (instanceId) {
          setInstanceId(instanceId);
        }
      }
      // Don't fail if early provisioning fails - user can still continue

      setStep("gemini");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Anthropic API Key</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Required. Powers the main AI capabilities of your assistant.
        </p>
      </div>

      {/* Use cases */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Claude Opus 4.5 enables</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Conversations</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Brain className="w-4 h-4 text-primary" />
            <span>Reasoning</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Code className="w-4 h-4 text-primary" />
            <span>Code execution</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Tool calling</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Get your API key from Anthropic Console
          <ExternalLink className="w-3 h-3" />
        </a>

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
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
      </div>

      <Button onClick={handleContinue} size="lg" className="w-full" disabled={!key || loading}>
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
