/*
 * @bitcode/google-analytics
 * ---------------------------------------------
 * A very small convenience wrapper around Google Analytics (GA4) that:
 *   • Makes calls type-safe for TS projects.
 *   • No-ops when executed in non-browser contexts or when the gtag snippet
 *     has not loaded yet – avoiding ReferenceErrors in SSR / script-blocked
 *     environments.
 *   • Captures unexpected usage errors via Sentry so we keep eyes on any
 *     instrumentation gaps without crashing the user experience.
 */

import { captureException } from '@bitcode/external-telemetry-sentry';

// Internal helpers ----------------------------------------------------------

function hasGa(): boolean {
  return typeof globalThis !== 'undefined' && typeof (globalThis as any).gtag === 'function';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callGtag(...args: any[]) {
  try {
    if (hasGa()) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – dynamic call into GA global
      (globalThis as any).gtag(...args);
    }
  } catch (err) {
    // Unexpected – capture so we notice but swallow so UI does not break.
    captureException(err);
  }
}

// Public API ----------------------------------------------------------------

export interface EventParams {
  event_category?: string;
  event_label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Fire a GA4 event.  Silently ignored on the server / when GA not loaded.
 */
export function trackEvent(name: string, params: EventParams = {}): void {
  callGtag('event', name, params);
}

/**
 * Set GA4 user properties (merged onto existing properties).
 */
export function setUserProperties(props: Record<string, unknown>): void {
  callGtag('set', props);
}

/**
 * Initialize GA on the client.  In most cases Next.js or the host application
 * injects the GA script tag, but exposing an explicit init makes testing &
 * server-side fallback (Measurement Protocol) easier.
 */
export interface GAInitOptions {
  measurementId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function init({ measurementId, ...extra }: GAInitOptions): void {
  callGtag('js', new Date());
  callGtag('config', measurementId, extra);
}

// ---------------------------------------------------------------------------
// Graceful Measurement Protocol fallback (server-side events)
// ---------------------------------------------------------------------------

/**
 * Send server-side events using GA4 Measurement Protocol.  Requires the
 * GA_MEASUREMENT_ID and GA_API_SECRET env vars to be configured.
 *
 * The implementation purposefully keeps the API minimal – we only use this
 * in critical backend paths (e.g. billing) where losing the event entirely
 * would be unacceptable.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendServerEvent(name: string, params: Record<string, any> = {}): Promise<void> {
  try {
    const { GA_MEASUREMENT_ID, GA_API_SECRET } = process.env;
    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) return;

    const body = {
      client_id: params.client_id ?? 'server',
      events: [
        {
          name,
          params,
        },
      ],
    };

    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
  } catch (err) {
    captureException(err);
  }
}

export default {
  trackEvent,
  setUserProperties,
  init,
  sendServerEvent,
};
