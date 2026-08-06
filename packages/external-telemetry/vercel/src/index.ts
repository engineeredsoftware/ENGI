/**
 * @bitcode/external-telemetry-vercel
 *
 * Thin adapter around @vercel/analytics for product event tracking.
 * Used by @bitcode/observability product-analytics composition.
 */

export { track as trackVercelAnalytics } from '@vercel/analytics';

/** Fire-and-forget Vercel analytics event. */
export function trackVercelEvent(name: string, data?: Record<string, unknown>): void {
  try {
    // track accepts string name + optional data in @vercel/analytics
    const { track } = require('@vercel/analytics') as typeof import('@vercel/analytics');
    track(name, data as any);
  } catch {
    // no-op when analytics unavailable
  }
}
