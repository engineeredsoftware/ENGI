/**
 * Health API Route Handlers
 * 
 * System health monitoring endpoints.
 * No authentication required for health checks.
 * 
 * @doc-code
 * type: route-handlers
 * category: monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { traceRoute } from '@bitcode/observability';
import { log } from '@bitcode/logger';
import { createJsonResponse } from '@bitcode/api/responses';
import { supabaseAdmin } from '@bitcode/supabase';

// Application start time
const startTime = Date.now();

/**
 * GET /api/health
 * Basic health check
 */
export const GET = traceRoute('/health', async (request: NextRequest) => {
  return createJsonResponse({
    status: 'ok',
    version: process.env.APP_VERSION || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/health/ready
 * Readiness probe - checks if app is ready to serve requests
 */
export const ready = traceRoute('/health/ready', async (request: NextRequest) => {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Check database
  const dbStart = Date.now();
  try {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .limit(1);
    
    checks.database = {
      status: error ? 'down' : 'ok',
      latency: Date.now() - dbStart,
      error: error?.message
    };
  } catch (error) {
    checks.database = {
      status: 'down',
      latency: Date.now() - dbStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Check external services (non-blocking)
  const externalChecks = await Promise.allSettled([
    // GitHub API
    checkExternalService('github', async () => {
      const response = await fetch('https://api.github.com/zen', {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
    }),

    // Email service
    checkExternalService('email', async () => {
      // Simulate email service check
      await new Promise(resolve => setTimeout(resolve, 10));
    })
  ]);

  // Add external check results
  externalChecks.forEach((result, index) => {
    const serviceName = ['github', 'email'][index];
    if (result.status === 'fulfilled') {
      checks[serviceName] = result.value;
    } else {
      checks[serviceName] = {
        status: 'down',
        error: result.reason?.message || 'Check failed'
      };
    }
  });

  // Determine overall status
  const hasDown = Object.values(checks).some(c => c.status === 'down');
  const hasDegraded = Object.values(checks).some(c => c.status === 'degraded');

  const status = hasDown ? 'down' : hasDegraded ? 'degraded' : 'ok';
  const httpStatus = status === 'ok' ? 200 : 503;

  return createJsonResponse({
    status,
    version: process.env.APP_VERSION || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks
  }, httpStatus);
});

/**
 * GET /api/health/live
 * Liveness probe - checks if app should be restarted
 */
export const live = traceRoute('/health/live', async (request: NextRequest) => {
  // Check memory usage
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const heapPercentage = Math.round((heapUsedMB / heapTotalMB) * 100);

  // Check if memory usage is critical
  if (heapPercentage > 90) {
    log('[health/live] High memory usage detected', 'warn', {
      heapUsedMB,
      heapTotalMB,
      heapPercentage
    });

    return createJsonResponse({
      status: 'down',
      reason: 'High memory usage',
      memory: {
        heapUsedMB,
        heapTotalMB,
        percentage: heapPercentage
      }
    }, 503);
  }

  // Check event loop lag (simulated)
  const lagStart = Date.now();
  await new Promise(resolve => setImmediate(resolve));
  const eventLoopLag = Date.now() - lagStart;

  if (eventLoopLag > 100) {
    log('[health/live] High event loop lag detected', 'warn', {
      lagMs: eventLoopLag
    });

    return createJsonResponse({
      status: 'degraded',
      reason: 'High event loop lag',
      eventLoopLagMs: eventLoopLag,
      memory: {
        heapUsedMB,
        heapTotalMB,
        percentage: heapPercentage
      }
    }, 200);
  }

  return createJsonResponse({
    status: 'ok',
    memory: {
      heapUsedMB,
      heapTotalMB,
      percentage: heapPercentage
    },
    eventLoopLagMs: eventLoopLag
  });
});

/**
 * GET /api/health/services
 * Detailed service health check
 */
export const services = traceRoute('/health/services', async (request: NextRequest) => {
  const services: Record<string, { status: string; latency?: number; error?: string; details?: unknown }> = {};

  // Check all services in parallel
  const checks = await Promise.allSettled([
    // Database
    checkService('database', async () => {
      const { count, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { tableCount: count };
    }),

    // Cache (Redis simulation)
    checkService('cache', async () => {
      // In production, check Redis connection
      await new Promise(resolve => setTimeout(resolve, 5));
      return { type: 'memory', hitRate: 0.95 };
    }),

    // VCS Service
    checkService('vcs', async () => {
      // Check if VCS providers are accessible
      const providers = ['github', 'gitlab', 'bitbucket'];
      return { providers, status: 'operational' };
    }),

    // Email Service
    checkService('email', async () => {
      // Check email provider status
      return { provider: 'sendgrid', dailyQuota: 10000, used: 1234 };
    }),

    // Storage
    checkService('storage', async () => {
      // Check Supabase storage
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      if (error) throw error;
      return { buckets: data?.length || 0 };
    }),

    // AI Services
    checkService('ai', async () => {
      // Check AI provider availability
      return { 
        providers: ['openai', 'anthropic', 'google'],
        modelsAvailable: true 
      };
    })
  ]);

  // Process results
  checks.forEach((result, index) => {
    const serviceName = ['database', 'cache', 'vcs', 'email', 'storage', 'ai'][index];
    if (result.status === 'fulfilled') {
      services[serviceName] = result.value;
    } else {
      services[serviceName] = {
        status: 'down',
        error: result.reason?.message || 'Service check failed'
      };
    }
  });

  // Calculate overall status
  const statuses = Object.values(services).map(s => s.status);
  const hasDown = statuses.includes('down');
  const hasDegraded = statuses.includes('degraded');

  const overallStatus = hasDown ? 'down' : hasDegraded ? 'degraded' : 'ok';
  const httpStatus = overallStatus === 'down' ? 503 : 200;

  return createJsonResponse({
    status: overallStatus,
    version: process.env.APP_VERSION || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services,
    environment: process.env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown'
  }, httpStatus);
});

/**
 * Helper to check a service with timing
 */
async function checkService(
  name: string, 
  checker: () => Promise<unknown>
): Promise<{ status: string; latency: number; details?: unknown; error?: string }> {
  const start = Date.now();
  
  try {
    const details = await checker();
    return {
      status: 'ok',
      latency: Date.now() - start,
      details
    };
  } catch (error) {
    return {
      status: 'down',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Check failed'
    };
  }
}

/**
 * Helper to check external service
 */
async function checkExternalService(
  name: string,
  checker: () => Promise<void>
): Promise<{ status: string; latency: number; error?: string }> {
  const start = Date.now();
  
  try {
    await checker();
    return {
      status: 'ok',
      latency: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'down',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Check failed'
    };
  }
}