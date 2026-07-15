/**
 * UAPI MIDDLEWARE - Centralized Middleware Pipeline
 *
 * Consolidates all middleware concerns into a unified, composable system.
 * Provides pipeline-based middleware composition for V26 production readiness.
 */

import { NextRequest, NextResponse } from 'next/server';

// Type definitions for middleware pipeline
export interface MiddlewareContext {
  request: NextRequest;
  response?: NextResponse;
  metadata: Map<string, any>;
  userId?: string;
  organizationId?: string;
  requestId: string;
  startTime: number;
}

export type MiddlewareHandler = (
  context: MiddlewareContext
) => Promise<MiddlewareContext | NextResponse>;

export interface MiddlewareConfig {
  name: string;
  enabled: boolean;
  order: number;
  matcher?: (request: NextRequest) => boolean;
  handler: MiddlewareHandler;
}

/**
 * Middleware pipeline executor
 */
export class MiddlewarePipeline {
  private middlewares: MiddlewareConfig[] = [];

  constructor(middlewares: MiddlewareConfig[]) {
    // Sort by order for deterministic execution
    this.middlewares = middlewares.sort((a, b) => a.order - b.order);
  }

  async execute(request: NextRequest): Promise<NextResponse> {
    const context: MiddlewareContext = {
      request,
      metadata: new Map(),
      requestId: crypto.randomUUID(),
      startTime: Date.now()
    };

    for (const middleware of this.middlewares) {
      // Skip disabled middlewares
      if (!middleware.enabled) continue;

      // Check if middleware should run for this request
      if (middleware.matcher && !middleware.matcher(request)) continue;

      try {
        const result = await middleware.handler(context);

        // If middleware returns NextResponse, short-circuit pipeline
        if (result instanceof NextResponse) {
          return result;
        }

        // Update context for next middleware
        Object.assign(context, result);
      } catch (error) {
        console.error(`[middleware-pipeline] Error in ${middleware.name}:`, error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }

    // Default: continue to application
    return context.response || NextResponse.next();
  }

  /**
   * Add middleware dynamically
   */
  addMiddleware(config: MiddlewareConfig): void {
    this.middlewares.push(config);
    this.middlewares.sort((a, b) => a.order - b.order);
  }

  /**
   * Remove middleware by name
   */
  removeMiddleware(name: string): void {
    this.middlewares = this.middlewares.filter(m => m.name !== name);
  }

  /**
   * Enable/disable middleware by name
   */
  toggleMiddleware(name: string, enabled: boolean): void {
    const middleware = this.middlewares.find(m => m.name === name);
    if (middleware) {
      middleware.enabled = enabled;
    }
  }
}

// Factory for creating configured pipeline
export async function createMiddlewarePipeline(): Promise<MiddlewarePipeline> {
  const middlewares: MiddlewareConfig[] = [
    // Order matters! Lower numbers run first
    {
      name: 'telemetry',
      enabled: true,
      order: 10,
      handler: (await import('./telemetry')).telemetryMiddleware
    },
    {
      name: 'security-headers',
      enabled: true,
      order: 20,
      handler: (await import('./security-headers')).securityHeadersMiddleware
    },
    {
      name: 'cors',
      enabled: true,
      order: 30,
      handler: (await import('./cors')).corsMiddleware
    },
    {
      name: 'rate-limit',
      enabled: true,
      order: 40,
      handler: (await import('./rate-limit')).rateLimitMiddleware
    },
    {
      name: 'authentication',
      enabled: true,
      order: 50,
      matcher: (req) => !req.nextUrl.pathname.startsWith('/public'),
      handler: (await import('./authentication')).authenticationMiddleware
    },
    {
      name: 'route-rewrite',
      enabled: true,
      order: 60,
      handler: (await import('./route-rewrite')).routeRewriteMiddleware
    }
  ];

  return new MiddlewarePipeline(middlewares);
}
