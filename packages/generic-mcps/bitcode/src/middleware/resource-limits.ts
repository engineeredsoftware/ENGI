/**
 * Resource Limits and Timeout Middleware for MCP Server
 * 
 * Implements comprehensive resource protection including:
 * - Request timeout enforcement
 * - Memory usage monitoring
 * - CPU usage tracking
 * - Request size limits
 * - Concurrent execution limits
 */

import { logger } from '@bitcode/logger';
import { observability } from '@bitcode/observability';
import type { MCPAuthContext } from '../types';

/**
 * Resource limit configuration
 */
export interface ResourceLimits {
  maxRequestSize: number;           // Maximum request payload size in bytes
  maxExecutionTime: number;         // Maximum execution time in milliseconds
  maxMemoryUsage: number;          // Maximum memory usage in MB
  maxConcurrentRequests: number;    // Maximum concurrent requests per user
  maxCpuUsage: number;             // Maximum CPU usage percentage (0-100)
  enableKillSwitch: boolean;       // Enable forceful termination on limit breach
}

/**
 * Default resource limits
 */
export const DEFAULT_RESOURCE_LIMITS: ResourceLimits = {
  maxRequestSize: 10 * 1024 * 1024,        // 10MB
  maxExecutionTime: 5 * 60 * 1000,         // 5 minutes
  maxMemoryUsage: 2048,                    // 2GB
  maxConcurrentRequests: 5,                // 5 concurrent requests per user
  maxCpuUsage: 80,                         // 80% CPU
  enableKillSwitch: true
};

/**
 * Active request tracker
 */
class RequestTracker {
  private activeRequests = new Map<string, Set<string>>();
  private requestMetrics = new Map<string, {
    startTime: number;
    memoryStart: number;
    cpuStart: number;
  }>();

  /**
   * Track a new request
   */
  trackRequest(userId: string, requestId: string): boolean {
    if (!this.activeRequests.has(userId)) {
      this.activeRequests.set(userId, new Set());
    }
    
    const userRequests = this.activeRequests.get(userId)!;
    if (userRequests.size >= DEFAULT_RESOURCE_LIMITS.maxConcurrentRequests) {
      return false; // Too many concurrent requests
    }
    
    userRequests.add(requestId);
    this.requestMetrics.set(requestId, {
      startTime: Date.now(),
      memoryStart: process.memoryUsage().heapUsed,
      cpuStart: process.cpuUsage().user + process.cpuUsage().system
    });
    
    return true;
  }

  /**
   * Untrack a request
   */
  untrackRequest(userId: string, requestId: string): void {
    const userRequests = this.activeRequests.get(userId);
    if (userRequests) {
      userRequests.delete(requestId);
      if (userRequests.size === 0) {
        this.activeRequests.delete(userId);
      }
    }
    this.requestMetrics.delete(requestId);
  }

  /**
   * Get request metrics
   */
  getRequestMetrics(requestId: string) {
    return this.requestMetrics.get(requestId);
  }

  /**
   * Get active request count for user
   */
  getActiveRequestCount(userId: string): number {
    return this.activeRequests.get(userId)?.size || 0;
  }
}

// Global request tracker instance
const requestTracker = new RequestTracker();

/**
 * Enforce resource limits on execution
 */
export async function enforceResourceLimits<T>(
  fn: () => Promise<T>,
  context: MCPAuthContext,
  requestId: string,
  limits: Partial<ResourceLimits> = {}
): Promise<T> {
  const effectiveLimits = { ...DEFAULT_RESOURCE_LIMITS, ...limits };
  
  // Check concurrent request limit
  if (!requestTracker.trackRequest(context.userId, requestId)) {
    throw new Error(`Concurrent request limit exceeded for user ${context.userId}`);
  }
  
  // Create timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, effectiveLimits.maxExecutionTime);
  
  // Resource monitoring interval
  let monitoringInterval: NodeJS.Timeout | null = null;
  
  try {
    // Start resource monitoring
    monitoringInterval = setInterval(() => {
      checkResourceUsage(requestId, effectiveLimits, timeoutController);
    }, 1000); // Check every second
    
    // Execute function with timeout
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        timeoutController.signal.addEventListener('abort', () => {
          reject(new Error(`Execution timeout after ${effectiveLimits.maxExecutionTime}ms`));
        });
      })
    ]);
    
    // Record successful execution metrics
    recordExecutionMetrics(requestId, context, true);
    
    return result;
    
  } catch (error) {
    // Record failed execution metrics
    recordExecutionMetrics(requestId, context, false, error);
    throw error;
    
  } finally {
    // Cleanup
    clearTimeout(timeoutId);
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }
    requestTracker.untrackRequest(context.userId, requestId);
  }
}

/**
 * Check current resource usage
 */
function checkResourceUsage(
  requestId: string, 
  limits: ResourceLimits,
  controller: AbortController
): void {
  const metrics = requestTracker.getRequestMetrics(requestId);
  if (!metrics) return;
  
  // Check memory usage
  const currentMemory = process.memoryUsage().heapUsed;
  const memoryUsedMB = (currentMemory - metrics.memoryStart) / (1024 * 1024);
  
  if (memoryUsedMB > limits.maxMemoryUsage) {
    logger.error('Memory limit exceeded', {
      requestId,
      memoryUsedMB,
      limit: limits.maxMemoryUsage
    });
    
    if (limits.enableKillSwitch) {
      controller.abort();
    }
  }
  
  // Check CPU usage (approximate)
  const cpuUsage = process.cpuUsage();
  const cpuTime = (cpuUsage.user + cpuUsage.system) - metrics.cpuStart;
  const elapsedTime = Date.now() - metrics.startTime;
  const cpuPercent = (cpuTime / 1000 / elapsedTime) * 100;
  
  if (cpuPercent > limits.maxCpuUsage) {
    logger.warn('High CPU usage detected', {
      requestId,
      cpuPercent,
      limit: limits.maxCpuUsage
    });
  }
}

/**
 * Record execution metrics
 */
function recordExecutionMetrics(
  requestId: string,
  context: MCPAuthContext,
  success: boolean,
  error?: any
): void {
  const metrics = requestTracker.getRequestMetrics(requestId);
  if (!metrics) return;
  
  const duration = Date.now() - metrics.startTime;
  const memoryUsed = (process.memoryUsage().heapUsed - metrics.memoryStart) / (1024 * 1024);
  
  observability.recordMetric('mcp_request_resources', {
    requestId,
    userId: context.userId,
    duration,
    memoryUsedMB: memoryUsed,
    success,
    error: error?.message
  });
  
  logger.info('Request resource usage', {
    requestId,
    userId: context.userId,
    duration,
    memoryUsedMB: Math.round(memoryUsed),
    success
  });
}

/**
 * Check request size limit
 */
export function checkRequestSize(
  requestData: any,
  maxSize: number = DEFAULT_RESOURCE_LIMITS.maxRequestSize
): void {
  const size = Buffer.byteLength(JSON.stringify(requestData));
  
  if (size > maxSize) {
    throw new Error(`Request size ${size} bytes exceeds maximum ${maxSize} bytes`);
  }
}

/**
 * Create resource-limited execution wrapper
 */
export function createResourceLimitedExecutor(
  limits?: Partial<ResourceLimits>
) {
  return function resourceLimited<T extends (...args: any[]) => Promise<any>>(
    target: T
  ): T {
    return (async (...args: Parameters<T>) => {
      const context = args.find(arg => arg?.userId && arg?.role) as MCPAuthContext;
      if (!context) {
        throw new Error('MCPAuthContext required for resource-limited execution');
      }
      
      const requestId = `${context.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return enforceResourceLimits(
        () => target(...args),
        context,
        requestId,
        limits
      );
    }) as T;
  };
}

/**
 * Express-style middleware for resource limits
 */
export function resourceLimitMiddleware(limits?: Partial<ResourceLimits>) {
  return async (req: any, res: any, next: any) => {
    try {
      // Check request size
      checkRequestSize(req.body);
      
      // Add resource limit enforcement to response
      const originalJson = res.json;
      res.json = function(data: any) {
        // Record response size
        const responseSize = Buffer.byteLength(JSON.stringify(data));
        observability.recordMetric('mcp_response_size', {
          path: req.path,
          method: req.method,
          size: responseSize
        });
        
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      res.status(413).json({
        error: 'Request size limit exceeded',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}