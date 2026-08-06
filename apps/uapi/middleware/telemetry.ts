/**
 * TELEMETRY MIDDLEWARE
 *
 * Captures request metrics and performance data for monitoring.
 * Integrates with logging and metrics systems.
 */

import { log } from '@bitcode/logger';
import type { MiddlewareContext, MiddlewareHandler } from './index';

interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: string;
  organizationId?: string;
  userAgent?: string;
  referer?: string;
}

/**
 * Telemetry middleware handler
 */
export const telemetryMiddleware: MiddlewareHandler = async (context) => {
  const { request, requestId, startTime } = context;

  // Capture request info
  const metrics: Partial<RequestMetrics> = {
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent') ?? undefined,
    referer: request.headers.get('referer') ?? undefined
  };

  // Add cleanup handler for response metrics
  context.metadata.set('telemetry', {
    captureResponse: (statusCode: number) => {
      metrics.statusCode = statusCode;
      metrics.duration = Date.now() - startTime;
      metrics.userId = context.userId;
      metrics.organizationId = context.organizationId;

      // Log metrics
      log('[telemetry] Request completed', 'info', {
        requestId,
        ...metrics
      });

      // Send to metrics service if configured
      if (process.env.METRICS_ENDPOINT) {
        sendMetrics(metrics as RequestMetrics).catch(err => {
          log('[telemetry] Failed to send metrics', 'error', {
            error: err instanceof Error ? err.message : String(err)
          });
        });
      }
    }
  });

  return context;
};

/**
 * Send metrics to external service
 */
async function sendMetrics(metrics: RequestMetrics): Promise<void> {
  if (!process.env.METRICS_ENDPOINT) return;

  await fetch(process.env.METRICS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.METRICS_API_KEY}`
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'apps/uapi',
      environment: process.env.NODE_ENV,
      metrics
    })
  });
}