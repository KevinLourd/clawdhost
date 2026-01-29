import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return; // Skip if no key configured
  if (posthog.__loaded) return; // Prevent double init
  
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    
    // User identification
    person_profiles: "identified_only",
    
    // Pageview tracking
    capture_pageview: false, // We handle this manually for SPA
    capture_pageleave: true,
    
    // Session replay - record user sessions
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
      },
      // Record network requests for debugging
      recordHeaders: true,
      recordBody: false,
    },
    
    // Error tracking - auto-capture exceptions
    autocapture: true,
    capture_dead_clicks: true,
    
    // Web vitals & performance
    capture_performance: true,
    
    // Privacy settings
    mask_all_text: false,
    mask_all_element_attributes: false,
    
    // Debug in development
    debug: process.env.NODE_ENV === "development",
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function identifyUser(email: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.identify(email, { email, ...properties });
}

export function captureException(error: Error, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.captureException(error, properties);
}

export { posthog };
