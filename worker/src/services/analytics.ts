/**
 * PostHog analytics for backend events
 */

import { PostHog } from "posthog-node";

let posthog: PostHog | null = null;

function getPostHog(): PostHog | null {
  if (!process.env.POSTHOG_API_KEY) {
    console.warn("[Analytics] POSTHOG_API_KEY not configured");
    return null;
  }

  if (!posthog) {
    posthog = new PostHog(process.env.POSTHOG_API_KEY, {
      host: "https://eu.i.posthog.com", // EU region
    });
  }

  return posthog;
}

interface ProvisioningEventProps {
  planId: string;
  customerEmail: string;
  serverId?: string;
  serverIp?: string;
  tunnelUrl?: string;
  error?: string;
  durationMs?: number;
}

export function trackProvisioningStarted(props: ProvisioningEventProps) {
  const ph = getPostHog();
  if (!ph) return;

  ph.capture({
    distinctId: props.customerEmail,
    event: "provisioning_started",
    properties: {
      plan_id: props.planId,
      $set: { email: props.customerEmail },
    },
  });
}

export function trackServerCreated(props: ProvisioningEventProps) {
  const ph = getPostHog();
  if (!ph) return;

  ph.capture({
    distinctId: props.customerEmail,
    event: "server_created",
    properties: {
      plan_id: props.planId,
      server_id: props.serverId,
      server_ip: props.serverIp,
    },
  });
}

export function trackInstallationComplete(props: ProvisioningEventProps) {
  const ph = getPostHog();
  if (!ph) return;

  ph.capture({
    distinctId: props.customerEmail,
    event: "installation_complete",
    properties: {
      plan_id: props.planId,
      server_id: props.serverId,
      tunnel_url: props.tunnelUrl,
      duration_ms: props.durationMs,
    },
  });
}

export function trackProvisioningComplete(props: ProvisioningEventProps) {
  const ph = getPostHog();
  if (!ph) return;

  ph.capture({
    distinctId: props.customerEmail,
    event: "provisioning_complete",
    properties: {
      plan_id: props.planId,
      server_id: props.serverId,
      tunnel_url: props.tunnelUrl,
      duration_ms: props.durationMs,
    },
  });
}

export function trackProvisioningFailed(props: ProvisioningEventProps) {
  const ph = getPostHog();
  if (!ph) return;

  ph.capture({
    distinctId: props.customerEmail,
    event: "provisioning_failed",
    properties: {
      plan_id: props.planId,
      server_id: props.serverId,
      error: props.error,
      duration_ms: props.durationMs,
    },
  });
}

export async function flushAnalytics() {
  const ph = getPostHog();
  if (ph) {
    await ph.shutdown();
    posthog = null;
  }
}
