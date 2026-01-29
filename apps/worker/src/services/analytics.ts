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
      flushAt: 1, // Send events immediately for real-time tracking
      flushInterval: 0,
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
  provider?: string;
  serverType?: string;
  region?: string;
}

// Identify user with properties
export function identifyUser(email: string, properties?: Record<string, unknown>) {
  const ph = getPostHog();
  if (!ph) return;

  ph.identify({
    distinctId: email,
    properties: {
      email,
      ...properties,
    },
  });
}

export function trackProvisioningStarted(props: ProvisioningEventProps) {
  const ph = getPostHog();
  if (!ph) return;

  // Identify user first
  ph.identify({
    distinctId: props.customerEmail,
    properties: {
      email: props.customerEmail,
      plan_id: props.planId,
      first_provisioning_started: new Date().toISOString(),
    },
  });

  ph.capture({
    distinctId: props.customerEmail,
    event: "provisioning_started",
    properties: {
      plan_id: props.planId,
      provider: props.provider || "hetzner",
      server_type: props.serverType,
      region: props.region,
      timestamp: new Date().toISOString(),
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
      provider: props.provider || "hetzner",
      server_type: props.serverType,
      region: props.region,
      duration_ms: props.durationMs,
    },
  });
}

export function trackInstallationStarted(props: ProvisioningEventProps) {
  const ph = getPostHog();
  if (!ph) return;

  ph.capture({
    distinctId: props.customerEmail,
    event: "installation_started",
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

  // Update user properties on successful provisioning
  ph.identify({
    distinctId: props.customerEmail,
    properties: {
      has_active_server: true,
      current_plan: props.planId,
      server_id: props.serverId,
      tunnel_url: props.tunnelUrl,
      provisioning_completed_at: new Date().toISOString(),
    },
  });

  ph.capture({
    distinctId: props.customerEmail,
    event: "provisioning_complete",
    properties: {
      plan_id: props.planId,
      server_id: props.serverId,
      tunnel_url: props.tunnelUrl,
      duration_ms: props.durationMs,
      provider: props.provider || "hetzner",
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
      provider: props.provider || "hetzner",
    },
  });
}

export function trackDeprovisioningStarted(props: { customerEmail: string; serverId: string }) {
  const ph = getPostHog();
  if (!ph) return;

  ph.capture({
    distinctId: props.customerEmail,
    event: "deprovisioning_started",
    properties: {
      server_id: props.serverId,
    },
  });
}

export function trackDeprovisioningComplete(props: { customerEmail: string; serverId: string }) {
  const ph = getPostHog();
  if (!ph) return;

  ph.identify({
    distinctId: props.customerEmail,
    properties: {
      has_active_server: false,
      server_id: null,
      tunnel_url: null,
    },
  });

  ph.capture({
    distinctId: props.customerEmail,
    event: "deprovisioning_complete",
    properties: {
      server_id: props.serverId,
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
