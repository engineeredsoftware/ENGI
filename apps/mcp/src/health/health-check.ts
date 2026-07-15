/**
 * Health Check System for MCP Server
 * 
 * Provides comprehensive health monitoring for production readiness
 */

import { logger } from '@bitcode/logger';
import { supabaseAdmin } from '@bitcode/supabase';
import { CircuitBreaker } from '../middleware/rate-limit';
import { streamManager } from '../streaming/pipeline-stream';

/**
 * Health status
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    authentication: HealthCheck;
    streaming: HealthCheck;
    pipelines: HealthCheck;
    circuitBreakers: CircuitBreakerStatus[];
    memory: MemoryStatus;
    btd: HealthCheck;
  };
  environment?: string;
  serverId?: string;
}

/**
 * Individual health check result
 */
export interface HealthCheck {
  status: 'ok' | 'warning' | 'error';
  message?: string;
  latency?: number;
  details?: any;
}

/**
 * Circuit breaker status
 */
export interface CircuitBreakerStatus {
  name: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  successRate: number;
}

/**
 * Memory status
 */
export interface MemoryStatus {
  status: 'ok' | 'warning' | 'error';
  heapUsedMB: number;
  heapTotalMB: number;
  usagePercent: number;
  rss: number;
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(
  circuitBreakers: Record<string, CircuitBreaker>
): Promise<HealthStatus> {
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      authentication: await checkAuthentication(),
      streaming: await checkStreaming(),
      pipelines: await checkPipelines(),
      circuitBreakers: checkCircuitBreakers(circuitBreakers),
      memory: checkMemory(),
      btd: await checkBtdHoldingReadCarrier()
    },
    environment: process.env.NODE_ENV,
    serverId: process.env.SERVER_ID
  };

  // Determine overall health status
  const checks = Object.values(healthStatus.checks).filter(
    check => check && typeof check === 'object' && 'status' in check
  ) as HealthCheck[];
  
  const hasErrors = checks.some(check => check.status === 'error');
  const hasWarnings = checks.some(check => check.status === 'warning');
  
  if (hasErrors) {
    healthStatus.status = 'unhealthy';
  } else if (hasWarnings) {
    healthStatus.status = 'degraded';
  }

  return healthStatus;
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    const { error } = await supabaseAdmin
      .from('health_check')
      .select('id')
      .limit(1);
    
    if (error) {
      // Try a simpler query
      const { error: fallbackError } = await supabaseAdmin
        .from('api_keys')
        .select('count')
        .limit(1);
        
      if (fallbackError) {
        return {
          status: 'error',
          message: 'Database connection failed',
          details: { error: fallbackError.message }
        };
      }
    }
    
    const latency = Date.now() - start;
    
    return {
      status: latency > 1000 ? 'warning' : 'ok',
      message: 'Database connected',
      latency
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Database check failed',
      details: { error: error instanceof Error ? error.message : error }
    };
  }
}

/**
 * Check authentication service
 */
async function checkAuthentication(): Promise<HealthCheck> {
  try {
    // Check if auth service is reachable
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      return {
        status: 'error',
        message: 'Authentication service unavailable',
        details: { error: error.message }
      };
    }
    
    return {
      status: 'ok',
      message: 'Authentication service healthy'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Authentication check failed',
      details: { error: error instanceof Error ? error.message : error }
    };
  }
}

/**
 * Check streaming service
 */
async function checkStreaming(): Promise<HealthCheck> {
  try {
    const stats = streamManager.getConnectionStats();
    
    if (stats.totalConnections > 1000) {
      return {
        status: 'warning',
        message: 'High number of streaming connections',
        details: stats
      };
    }
    
    return {
      status: 'ok',
      message: 'Streaming service healthy',
      details: stats
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Streaming check failed',
      details: { error: error instanceof Error ? error.message : error }
    };
  }
}

/**
 * Check pipeline execution system
 */
async function checkPipelines(): Promise<HealthCheck> {
  try {
    // Check for stuck pipelines
    const { data: stuckPipelines, error } = await supabaseAdmin
      .from('executions')
      .select('count')
      .eq('status', 'running')
      .lt('created_at', new Date(Date.now() - 3600000).toISOString()); // Running > 1 hour
    
    if (error) {
      return {
        status: 'error',
        message: 'Pipeline check failed',
        details: { error: error.message }
      };
    }
    
    const stuckCount = stuckPipelines?.[0]?.count || 0;
    
    if (stuckCount > 10) {
      return {
        status: 'error',
        message: `${stuckCount} stuck pipelines detected`
      };
    } else if (stuckCount > 5) {
      return {
        status: 'warning',
        message: `${stuckCount} potentially stuck pipelines`
      };
    }
    
    return {
      status: 'ok',
      message: 'Pipeline system healthy'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Pipeline check failed',
      details: { error: error instanceof Error ? error.message : error }
    };
  }
}

/**
 * Check circuit breakers
 */
function checkCircuitBreakers(
  circuitBreakers: Record<string, CircuitBreaker>
): CircuitBreakerStatus[] {
  return Object.entries(circuitBreakers).map(([name, breaker]) => {
    const state = breaker.getState();
    const stats = breaker.getStats();
    
    return {
      name,
      state,
      failures: stats.failures,
      successRate: stats.successRate
    };
  });
}

export async function isReady(): Promise<boolean> {
  const database = await checkDatabase();
  const memory = checkMemory();
  return database.status !== 'error' && memory.status !== 'error';
}

export async function isAlive(): Promise<boolean> {
  return checkMemory().status !== 'error';
}

/**
 * Check memory usage
 */
function checkMemory(): MemoryStatus {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const usagePercent = Math.round((heapUsedMB / heapTotalMB) * 100);
  
  let status: 'ok' | 'warning' | 'error' = 'ok';
  if (usagePercent > 90) {
    status = 'error';
  } else if (usagePercent > 80) {
    status = 'warning';
  }
  
  return {
    status,
    heapUsedMB,
    heapTotalMB,
    usagePercent,
    rss: Math.round(usage.rss / 1024 / 1024)
  };
}

/**
 * Check BTD holding read carrier
 */
async function checkBtdHoldingReadCarrier(): Promise<HealthCheck> {
  try {
    // Check if BTD holding read carrier is functioning
    const { data, error } = await supabaseAdmin
      .from('user_credits')
      .select('user_id')
      .limit(1);
    
    if (error) {
      return {
        status: 'error',
        message: 'BTD holding read carrier unavailable',
        details: { error: error.message }
      };
    }
    
    return {
      status: 'ok',
      message: 'BTD holding read carrier healthy'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'BTD holding read-carrier check failed',
      details: { error: error instanceof Error ? error.message : error }
    };
  }
}

/**
 * Express health check endpoint handler
 */
export function createHealthCheckEndpoint(): (req: any, res: any) => Promise<void> {
  return async (req: any, res: any) => {
    try {
      const health = await performHealthCheck({});
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(health);
    } catch (error) {
      logger.error('Health check endpoint error', { error });
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed'
      });
    }
  };
}

/**
 * Express readiness check endpoint handler
 */
export function createReadinessEndpoint(): (req: any, res: any) => Promise<void> {
  return async (req: any, res: any) => {
    try {
      // Quick checks for readiness
      const dbCheck = await checkDatabase();
      const memCheck = checkMemory();
      
      const isReady = dbCheck.status !== 'error' && memCheck.status !== 'error';
      
      res.status(isReady ? 200 : 503).json({
        ready: isReady,
        database: dbCheck.status,
        memory: memCheck.status
      });
    } catch (error) {
      logger.error('Readiness check error', { error });
      res.status(503).json({ ready: false });
    }
  };
}
